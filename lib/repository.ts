import { getSupabase } from "./supabase";
import {
  QuoteSettings,
  Profile,
  Customer,
  DEFAULT_QUOTE,
  DEFAULT_PROFILE,
} from "./types";

// ============================================================================
// Schema error detection — table/column ยังไม่ได้สร้างใน Supabase
// ============================================================================
export interface SchemaIssue {
  code: string;
  message: string;
}

let schemaIssueWarned = new Set<string>();

export function isSchemaMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  if (!e.code && !e.message) return false;
  // PGRST205 = table not in schema cache
  // 42P01    = relation does not exist
  // 42703    = column does not exist
  if (e.code === "PGRST205" || e.code === "42P01" || e.code === "42703") {
    const key = `${e.code}:${e.message || ""}`;
    if (!schemaIssueWarned.has(key)) {
      schemaIssueWarned.add(key);
      console.warn(
        "[so1o] Database schema issue detected — รัน supabase/schema.sql ใน Supabase SQL Editor เพื่อแก้ไข\n",
        e.message || e.code
      );
    }
    return true;
  }
  return false;
}

export type DocumentType = "quote" | "invoice" | "receipt";
export type DocumentStatus = "draft" | "issued" | "paid" | "cancelled";
export type UserRole = "user" | "admin";

export interface DocumentExtra {
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  paidAmount?: number;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  linked_from_id: string | null;
  client_id: string | null;
  data: QuoteSettings & DocumentExtra;
  created_at: string;
  updated_at: string;
}

export interface DocumentSummary {
  id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  customerName: string;
  projectName: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  linkedFromId: string | null;
  clientId: string | null;
}

export interface ClientRecord {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  line_id: string;
  address: string;
  tax_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
  taxId: string;
  note: string;
  documentCount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRecord {
  user_id: string;
  data: Profile;
  role: UserRole;
}

// ========================================================================
// PROFILE
// ========================================================================

export async function fetchProfile(): Promise<Profile> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return DEFAULT_PROFILE;
  const { data, error } = await sb
    .from("profiles")
    .select("data")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_PROFILE;
  return { ...DEFAULT_PROFILE, ...(data.data as Profile) };
}

export async function fetchUserRole(): Promise<UserRole> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return "user";
  const { data, error } = await sb
    .from("profiles")
    .select("role")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) return "user";
  return ((data?.role as UserRole) || "user");
}

export async function saveProfile(profile: Profile): Promise<void> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { error } = await sb.from("profiles").upsert({
    user_id: auth.user.id,
    data: profile,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ========================================================================
// CLIENTS
// ========================================================================

function customerToInsert(c: Customer, userId: string) {
  return {
    user_id: userId,
    name: c.name.trim() || "ไม่ระบุชื่อ",
    phone: c.phone || "",
    email: c.email || "",
    line_id: c.lineId || "",
    address: c.address || "",
    tax_id: c.taxId || "",
    note: "",
  };
}

export function recordToCustomer(r: ClientRecord): Customer {
  return {
    name: r.name,
    phone: r.phone,
    email: r.email,
    lineId: r.line_id,
    address: r.address,
    taxId: r.tax_id,
  };
}

export async function listClients(): Promise<ClientSummary[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];

  const { data: clients, error } = await sb
    .from("clients")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("name", { ascending: true });
  if (error) {
    if (isSchemaMissing(error)) return [];
    throw error;
  }
  if (!clients || clients.length === 0) return [];

  const ids = clients.map((c) => c.id);
  const { data: docs, error: docErr } = await sb
    .from("documents")
    .select("client_id, type, data")
    .eq("user_id", auth.user.id)
    .in("client_id", ids);

  const stats = new Map<string, { count: number; total: number }>();
  if (!docErr) {
    (docs || []).forEach((d) => {
      if (!d.client_id) return;
      const cur = stats.get(d.client_id as string) || { count: 0, total: 0 };
      cur.count += 1;
      stats.set(d.client_id as string, cur);
    });
  } else {
    isSchemaMissing(docErr);
  }

  return (clients as ClientRecord[]).map((c) => {
    const s = stats.get(c.id) || { count: 0, total: 0 };
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      lineId: c.line_id,
      address: c.address,
      taxId: c.tax_id,
      note: c.note,
      documentCount: s.count,
      totalAmount: s.total,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    };
  });
}

export async function getClient(id: string): Promise<ClientRecord | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as ClientRecord | null;
}

export async function createClient(
  c: Customer,
  note = ""
): Promise<ClientRecord> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const insert = customerToInsert(c, auth.user.id);
  insert.note = note;
  const { data, error } = await sb
    .from("clients")
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return data as ClientRecord;
}

export async function updateClient(
  id: string,
  patch: Partial<Customer> & { note?: string }
): Promise<void> {
  const sb = getSupabase();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) update.name = patch.name || "ไม่ระบุชื่อ";
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.lineId !== undefined) update.line_id = patch.lineId;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.taxId !== undefined) update.tax_id = patch.taxId;
  if (patch.note !== undefined) update.note = patch.note;
  const { error } = await sb.from("clients").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("clients").delete().eq("id", id);
  if (error) throw error;
}

export async function findClientByName(
  name: string
): Promise<ClientRecord | null> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const { data, error } = await sb
    .from("clients")
    .select("*")
    .eq("user_id", auth.user.id)
    .ilike("name", trimmed)
    .limit(1);
  if (error) return null;
  if (!data || data.length === 0) return null;
  return data[0] as ClientRecord;
}

// ========================================================================
// DOCUMENTS
// ========================================================================

export async function listDocuments(
  type?: DocumentType
): Promise<DocumentSummary[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  let q = sb
    .from("documents")
    .select(
      "id, type, number, status, data, created_at, updated_at, linked_from_id, client_id"
    )
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  let { data, error } = await q;
  if (error && isSchemaMissing(error)) {
    // Fallback: try without client_id column
    let q2 = sb
      .from("documents")
      .select(
        "id, type, number, status, data, created_at, updated_at, linked_from_id"
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });
    if (type) q2 = q2.eq("type", type);
    const fallback = await q2;
    if (fallback.error) {
      if (isSchemaMissing(fallback.error)) return [];
      throw fallback.error;
    }
    data = fallback.data;
    error = null;
  }
  if (error) throw error;
  return (data || []).map((row) => {
    const d = row.data as QuoteSettings;
    return {
      id: row.id,
      type: row.type as DocumentType,
      number: row.number,
      status: row.status as DocumentStatus,
      customerName: d?.customer?.name || "",
      projectName: d?.projectName || "",
      total: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      linkedFromId: row.linked_from_id,
      clientId: (row as { client_id?: string }).client_id || null,
    };
  });
}

export async function listDocumentsByClient(
  clientId: string
): Promise<DocumentSummary[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await sb
    .from("documents")
    .select(
      "id, type, number, status, data, created_at, updated_at, linked_from_id, client_id"
    )
    .eq("user_id", auth.user.id)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) {
    if (isSchemaMissing(error)) return [];
    throw error;
  }
  return (data || []).map((row) => {
    const d = row.data as QuoteSettings;
    return {
      id: row.id,
      type: row.type as DocumentType,
      number: row.number,
      status: row.status as DocumentStatus,
      customerName: d?.customer?.name || "",
      projectName: d?.projectName || "",
      total: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      linkedFromId: row.linked_from_id,
      clientId: row.client_id || null,
    };
  });
}

export async function getDocument(
  id: string
): Promise<DocumentRecord | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as DocumentRecord | null;
}

export async function createDocument(input: {
  type: DocumentType;
  number: string;
  data: QuoteSettings & DocumentExtra;
  linkedFromId?: string | null;
  clientId?: string | null;
  status?: DocumentStatus;
}): Promise<DocumentRecord> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { data, error } = await sb
    .from("documents")
    .insert({
      user_id: auth.user.id,
      type: input.type,
      number: input.number,
      status: input.status || "draft",
      linked_from_id: input.linkedFromId || null,
      client_id: input.clientId || null,
      data: input.data,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DocumentRecord;
}

export async function updateDocument(
  id: string,
  patch: {
    data?: QuoteSettings & DocumentExtra;
    number?: string;
    status?: DocumentStatus;
    clientId?: string | null;
  }
): Promise<void> {
  const sb = getSupabase();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.data) update.data = patch.data;
  if (patch.number) update.number = patch.number;
  if (patch.status) update.status = patch.status;
  if (patch.clientId !== undefined) update.client_id = patch.clientId;
  const { error } = await sb.from("documents").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteDocument(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("documents").delete().eq("id", id);
  if (error) throw error;
}

export function emptyDocumentData(): QuoteSettings & DocumentExtra {
  return { ...DEFAULT_QUOTE };
}

// ========================================================================
// CLIENT MIGRATION HELPER
// ========================================================================
// สำหรับเอกสารเก่าที่ฝัง customer ใน data — ดึงออกมาสร้างเป็น client records
// แล้วผูก client_id กลับเข้าเอกสาร
export async function migrateEmbeddedCustomersToClients(): Promise<{
  created: number;
  linked: number;
}> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { created: 0, linked: 0 };

  const { data: docs, error: docErr } = await sb
    .from("documents")
    .select("id, data, client_id")
    .eq("user_id", auth.user.id)
    .is("client_id", null);
  if (docErr) throw docErr;
  if (!docs || docs.length === 0) return { created: 0, linked: 0 };

  const { data: existing } = await sb
    .from("clients")
    .select("id, name")
    .eq("user_id", auth.user.id);
  const nameMap = new Map<string, string>();
  (existing || []).forEach((c) =>
    nameMap.set((c.name as string).toLowerCase().trim(), c.id as string)
  );

  let created = 0;
  let linked = 0;

  for (const doc of docs) {
    const d = doc.data as QuoteSettings;
    const c = d?.customer;
    if (!c || !c.name || !c.name.trim()) continue;
    const key = c.name.toLowerCase().trim();
    let clientId = nameMap.get(key);

    if (!clientId) {
      const { data: ins, error: insErr } = await sb
        .from("clients")
        .insert(customerToInsert(c, auth.user.id))
        .select("id")
        .single();
      if (insErr) continue;
      clientId = ins.id as string;
      nameMap.set(key, clientId);
      created++;
    }

    await sb.from("documents").update({ client_id: clientId }).eq("id", doc.id);
    linked++;
  }

  return { created, linked };
}
