"use client";

import { useRef, useState } from "react";
import {
  X,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  StickyNote,
  Wrench,
  Upload,
  File as FileIcon,
  ImageIcon,
  FileText as FileTextIcon,
  Download,
  Loader2,
  Tag,
} from "lucide-react";
import {
  SupplierRecord,
  SupplierFile,
  uploadSupplierFile,
  removeSupplierFile,
  getSupplierFileUrl,
} from "@/lib/suppliers";
import { SUPPLIER_CATEGORIES } from "./SupplierFormModal";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  supplier: SupplierRecord;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChanged: () => Promise<void> | void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Whitelist of types that make sense as a supplier work-sample. Executables,
// scripts, archives etc. are blocked to limit hosted-malware risk in storage.
const ALLOWED_SUPPLIER_FILE_TYPES =
  "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf," +
  "video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav,audio/mp4," +
  ".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.mp4,.mov,.webm,.mp3,.wav";

const ALLOWED_SUPPLIER_MIME_PREFIXES = [
  "image/",
  "video/",
  "audio/",
  "application/pdf",
];

function isAllowedSupplierFile(file: File): boolean {
  if (!file.type) return false;
  return ALLOWED_SUPPLIER_MIME_PREFIXES.some((p) => file.type.startsWith(p));
}

export default function SupplierDetailModal({
  supplier,
  onClose,
  onEdit,
  onDelete,
  onChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { onBackdropClick } = useModalDismiss(onClose, { open: !uploading });

  const onPickFiles = () => inputRef.current?.click();

  const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.size > MAX_FILE_SIZE) {
          throw new Error(`ไฟล์ "${f.name}" เกิน 20 MB`);
        }
        if (!isAllowedSupplierFile(f)) {
          throw new Error(
            `ไฟล์ "${f.name}" รองรับเฉพาะรูป / วิดีโอ / เสียง / PDF เท่านั้น`
          );
        }
        await uploadSupplierFile(supplier.id, f);
      }
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onRemoveFile = async (fileId: string) => {
    if (!confirm("ลบไฟล์นี้?")) return;
    setRemovingId(fileId);
    try {
      await removeSupplierFile(supplier.id, fileId);
      await onChanged();
    } finally {
      setRemovingId(null);
    }
  };

  const onDownload = async (f: SupplierFile) => {
    const url = await getSupplierFileUrl(f.path, 3600);
    if (!url) {
      alert("ไม่สามารถสร้างลิงก์ดาวน์โหลดได้");
      return;
    }
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-2xl shadow-soft-lg max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b border-orange-100">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {(supplier.name[0] || "S").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-ink-900 truncate">
                {supplier.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                  {SUPPLIER_CATEGORIES[supplier.category]}
                </span>
                {supplier.service_type && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-50 text-brand-700 border border-orange-100 font-medium">
                    {supplier.service_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto space-y-4 scrollbar-thin">
          <section>
            <div className="text-xs font-semibold text-ink-700 mb-2">
              ข้อมูลติดต่อ
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <DetailRow icon={<Mail size={13} />} label="อีเมล" value={supplier.email} />
              <DetailRow icon={<Phone size={13} />} label="โทรศัพท์" value={supplier.phone} />
              <DetailRow
                icon={<MapPin size={13} />}
                label="ที่อยู่"
                value={supplier.address}
                long
              />
              <DetailRow icon={<Wrench size={13} />} label="ประเภทบริการ" value={supplier.service_type} />
              <DetailRow icon={<Tag size={13} />} label="หมวด" value={SUPPLIER_CATEGORIES[supplier.category]} />
              {supplier.note && (
                <DetailRow
                  icon={<StickyNote size={13} />}
                  label="หมายเหตุ"
                  value={supplier.note}
                  long
                />
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-ink-700">
                ไฟล์ตัวอย่างงาน
              </div>
              <div className="text-xs text-ink-400">
                {supplier.files.length} ไฟล์
              </div>
            </div>

            <button
              onClick={onPickFiles}
              disabled={uploading}
              className="w-full mb-3 flex items-center justify-center gap-2 border border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-700 rounded-2xl px-3 py-3 text-sm font-medium transition disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {uploading ? "กำลังอัปโหลด..." : "เพิ่มไฟล์ (สูงสุด 20 MB ต่อไฟล์)"}
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              accept={ALLOWED_SUPPLIER_FILE_TYPES}
              onChange={onFilesChange}
            />

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                {error}
              </div>
            )}

            {supplier.files.length === 0 ? (
              <div className="text-center text-xs text-ink-400 py-6 bg-orange-50/30 border border-dashed border-orange-200 rounded-2xl">
                ยังไม่มีไฟล์ — กดปุ่มด้านบนเพื่อเพิ่ม
              </div>
            ) : (
              <div className="space-y-1.5">
                {supplier.files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-orange-50/40 border border-orange-100 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0">
                      {f.type.startsWith("image/") ? (
                        /* eslint-disable-next-line jsx-a11y/alt-text */
                        <ImageIcon size={14} />
                      ) : f.type === "application/pdf" ? (
                        <FileTextIcon size={14} />
                      ) : (
                        <FileIcon size={14} />
                      )}
                    </div>
                    <button
                      onClick={() => onDownload(f)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="text-sm font-medium text-ink-900 truncate hover:text-emerald-700">
                        {f.name}
                      </div>
                      <div className="text-xs text-ink-400 tabular-nums">
                        {formatBytes(f.size)} ·{" "}
                        {new Date(f.uploaded_at).toLocaleDateString("th-TH")}
                      </div>
                    </button>
                    <button
                      onClick={() => onDownload(f)}
                      className="p-1.5 rounded-full hover:bg-white text-ink-400 hover:text-emerald-600 shrink-0"
                      aria-label="ดาวน์โหลด"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={() => onRemoveFile(f.id)}
                      disabled={removingId === f.id}
                      className="p-1.5 rounded-full hover:bg-red-50 text-ink-400 hover:text-red-600 shrink-0 disabled:opacity-50"
                      aria-label="ลบ"
                    >
                      {removingId === f.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="px-5 py-4 border-t border-orange-100 flex gap-2">
          {!confirmDelete ? (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                ลบ
              </button>
              <div className="flex-1" />
              <button
                onClick={onEdit}
                className="px-5 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-medium transition flex items-center gap-1.5"
              >
                <Pencil size={13} />
                แก้ไข
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-full border border-orange-200 text-ink-700 text-sm font-medium hover:bg-orange-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
              >
                ยืนยันลบ Supplier
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  long,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  long?: boolean;
}) {
  const empty = !value || !value.trim();
  return (
    <div
      className={`flex items-start gap-2.5 p-2.5 rounded-2xl bg-orange-50/40 border border-orange-100 ${
        long ? "sm:col-span-2" : ""
      }`}
    >
      <div className="w-7 h-7 rounded-lg bg-white text-emerald-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-ink-400 uppercase tracking-wide">
          {label}
        </div>
        <div
          className={`text-sm mt-0.5 break-words ${
            empty ? "text-ink-400 italic" : "text-ink-900"
          }`}
        >
          {empty ? "ไม่ระบุ" : value}
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
