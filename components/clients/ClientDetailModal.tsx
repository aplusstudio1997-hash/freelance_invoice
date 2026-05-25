"use client";

import { useEffect, useState } from "react";
import {
  X,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageCircle,
  StickyNote,
  Loader2,
  FileCheck2,
  Receipt,
  ExternalLink,
} from "lucide-react";
import {
  ClientRecord,
  DocumentSummary,
  listDocumentsByClient,
} from "@/lib/repository";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  client: ClientRecord;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenDocument: (id: string) => void;
}

const TYPE_LABELS: Record<DocumentSummary["type"], string> = {
  quote: "ใบเสนอราคา",
  invoice: "ใบแจ้งหนี้",
  receipt: "ใบเสร็จ",
};

const TYPE_COLORS: Record<DocumentSummary["type"], string> = {
  quote: "bg-orange-50 text-brand-700 border-brand-100",
  invoice: "bg-blue-50 text-blue-700 border-blue-100",
  receipt: "bg-green-50 text-green-700 border-green-100",
};

export default function ClientDetailModal({
  client,
  onClose,
  onEdit,
  onDelete,
  onOpenDocument,
}: Props) {
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { onBackdropClick } = useModalDismiss(onClose);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listDocumentsByClient(client.id);
        if (!cancelled) setDocs(list);
      } catch {
        if (!cancelled) setDocs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client.id]);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-2xl shadow-soft-lg max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b border-orange-100">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {(client.name[0] || "U").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-ink-900 truncate">{client.name}</h3>
              <div className="text-xs text-ink-400 mt-0.5">
                ลูกค้าตั้งแต่{" "}
                {new Date(client.created_at).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50 shrink-0"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-5 py-4 overflow-y-auto space-y-4 scrollbar-thin">
          <section>
            <div className="text-xs font-semibold text-ink-700 mb-2">
              ข้อมูลติดต่อ
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <DetailRow icon={<Mail size={13} />} label="อีเมล" value={client.email} />
              <DetailRow
                icon={<Phone size={13} />}
                label="โทรศัพท์"
                value={client.phone}
              />
              <DetailRow
                icon={<MessageCircle size={13} />}
                label="LINE ID"
                value={client.line_id}
              />
              <DetailRow
                icon={<FileText size={13} />}
                label="เลขประจำตัวผู้เสียภาษี"
                value={client.tax_id}
              />
              <DetailRow
                icon={<MapPin size={13} />}
                label="ที่อยู่"
                value={client.address}
                long
              />
              {client.note && (
                <DetailRow
                  icon={<StickyNote size={13} />}
                  label="หมายเหตุ"
                  value={client.note}
                  long
                />
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-ink-700">
                ประวัติเอกสาร
              </div>
              <div className="text-xs text-ink-400">{docs.length} ฉบับ</div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-ink-400">
                <Loader2 size={14} className="animate-spin mr-2" />
                กำลังโหลด...
              </div>
            ) : docs.length === 0 ? (
              <div className="text-center text-xs text-ink-400 py-8 bg-orange-50/30 border border-dashed border-orange-200 rounded-2xl">
                ยังไม่มีเอกสารกับลูกค้านี้
              </div>
            ) : (
              <div className="space-y-1.5">
                {docs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onOpenDocument(d.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-orange-50/40 hover:bg-orange-50 border border-orange-100 transition text-left"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-white text-brand-500 flex items-center justify-center">
                      {d.type === "receipt" ? (
                        <Receipt size={14} />
                      ) : d.type === "invoice" ? (
                        <FileCheck2 size={14} />
                      ) : (
                        <FileText size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${
                            TYPE_COLORS[d.type]
                          }`}
                        >
                          {TYPE_LABELS[d.type]}
                        </span>
                        <span className="text-xs font-semibold text-ink-900 truncate">
                          {d.number}
                        </span>
                      </div>
                      <div className="text-xs text-ink-400 truncate mt-0.5">
                        {d.projectName || "ไม่ระบุชื่อโครงการ"}
                      </div>
                    </div>
                    <ExternalLink size={13} className="text-ink-300 shrink-0" />
                  </button>
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
                ยืนยันลบลูกค้า
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
      <div className="w-7 h-7 rounded-lg bg-white text-brand-500 flex items-center justify-center shrink-0">
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
