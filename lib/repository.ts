import { getSupabase } from "./supabase";
import { QuoteSettings, Profile, DEFAULT_QUOTE, DEFAULT_PROFILE } from "./types";

export type DocumentType = "quote" | "invoice" | "receipt";
export type DocumentStatus = "draft" | "issued" | "paid" | "cancelled";

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
}

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

export async function saveProfile(profile: Profile): Promise<void> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { error } = await sb
    .from("profiles")
    .upsert({ user_id: auth.user.id, data: profile, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function listDocuments(
  type?: DocumentType
): Promise<DocumentSummary[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  let q = sb
    .from("documents")
    .select("id, type, number, status, data, created_at, updated_at, linked_from_id")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  const { data, error } = await q;
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
  }
): Promise<void> {
  const sb = getSupabase();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.data) update.data = patch.data;
  if (patch.number) update.number = patch.number;
  if (patch.status) update.status = patch.status;
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
