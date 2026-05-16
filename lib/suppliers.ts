import { getSupabase } from "./supabase";
import { isSchemaMissing } from "./repository";

export type SupplierCategory =
  | "photographer"
  | "videographer"
  | "designer"
  | "developer"
  | "printer"
  | "studio"
  | "model"
  | "voice_actor"
  | "translator"
  | "writer"
  | "marketer"
  | "logistics"
  | "other";

export interface SupplierFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export interface SupplierRecord {
  id: string;
  user_id: string;
  name: string;
  category: SupplierCategory;
  phone: string;
  email: string;
  address: string;
  service_type: string;
  note: string;
  files: SupplierFile[];
  created_at: string;
  updated_at: string;
}

export interface SupplierInput {
  name: string;
  category: SupplierCategory;
  phone?: string;
  email?: string;
  address?: string;
  serviceType?: string;
  note?: string;
}

const BUCKET = "supplier-files";

export async function listSuppliers(): Promise<SupplierRecord[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await sb
    .from("suppliers")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("name", { ascending: true });
  if (error) {
    if (isSchemaMissing(error)) return [];
    throw error;
  }
  return (data || []).map((r) => ({
    ...r,
    files: Array.isArray(r.files) ? r.files : [],
  })) as SupplierRecord[];
}

export async function getSupplier(
  id: string
): Promise<SupplierRecord | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    files: Array.isArray(data.files) ? data.files : [],
  } as SupplierRecord;
}

export async function createSupplier(
  input: SupplierInput
): Promise<SupplierRecord> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { data, error } = await sb
    .from("suppliers")
    .insert({
      user_id: auth.user.id,
      name: input.name,
      category: input.category,
      phone: input.phone || "",
      email: input.email || "",
      address: input.address || "",
      service_type: input.serviceType || "",
      note: input.note || "",
      files: [],
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, files: [] } as SupplierRecord;
}

export async function updateSupplier(
  id: string,
  patch: Partial<SupplierInput>
): Promise<void> {
  const sb = getSupabase();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.serviceType !== undefined) update.service_type = patch.serviceType;
  if (patch.note !== undefined) update.note = patch.note;
  const { error } = await sb.from("suppliers").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteSupplier(id: string): Promise<void> {
  const sb = getSupabase();
  const supplier = await getSupplier(id);
  if (supplier && supplier.files.length > 0) {
    const paths = supplier.files.map((f) => f.path);
    await sb.storage.from(BUCKET).remove(paths).catch(() => {});
  }
  const { error } = await sb.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}

// ========================================================================
// FILE UPLOADS
// ========================================================================

export async function uploadSupplierFile(
  supplierId: string,
  file: File
): Promise<SupplierFile> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const supplier = await getSupplier(supplierId);
  if (!supplier) throw new Error("Supplier not found");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const path = `${auth.user.id}/${supplierId}/${fileId}-${safeName}`;

  const { error: upErr } = await sb.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (upErr) throw upErr;

  const meta: SupplierFile = {
    id: fileId,
    name: file.name,
    path,
    size: file.size,
    type: file.type || "application/octet-stream",
    uploaded_at: new Date().toISOString(),
  };

  const nextFiles = [...supplier.files, meta];
  const { error: updErr } = await sb
    .from("suppliers")
    .update({ files: nextFiles, updated_at: new Date().toISOString() })
    .eq("id", supplierId);
  if (updErr) {
    await sb.storage.from(BUCKET).remove([path]).catch(() => {});
    throw updErr;
  }

  return meta;
}

export async function removeSupplierFile(
  supplierId: string,
  fileId: string
): Promise<void> {
  const sb = getSupabase();
  const supplier = await getSupplier(supplierId);
  if (!supplier) return;
  const target = supplier.files.find((f) => f.id === fileId);
  if (!target) return;
  await sb.storage.from(BUCKET).remove([target.path]).catch(() => {});
  const nextFiles = supplier.files.filter((f) => f.id !== fileId);
  await sb
    .from("suppliers")
    .update({ files: nextFiles, updated_at: new Date().toISOString() })
    .eq("id", supplierId);
}

export async function getSupplierFileUrl(
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const sb = getSupabase();
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}
