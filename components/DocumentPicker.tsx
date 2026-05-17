"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  FileCheck2,
  Receipt,
  Plus,
  Search,
  Check,
} from "lucide-react";
import { DocumentType } from "@/lib/types";
import { DocumentSummary, listDocuments } from "@/lib/repository";
import { useAuth } from "@/lib/auth";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  open: boolean;
  targetType: "invoice" | "receipt";
  onClose: () => void;
  onPick: (sourceId: string) => Promise<void> | void;
  onCreateBlank: () => Promise<void> | void;
}

const TYPE_LABELS: Record<DocumentType, string> = {
  quote: "ใบเสนอราคา",
  invoice: "ใบแจ้งหนี้",
  receipt: "ใบเสร็จรับเงิน",
};

const TYPE_ICONS: Record<DocumentType, typeof FileText> = {
  quote: FileText,
  invoice: FileCheck2,
  receipt: Receipt,
};

const TYPE_COLOR: Record<DocumentType, string> = {
  quote: "text-brand-700 bg-orange-50 border-brand-100",
  invoice: "text-blue-700 bg-blue-50 border-blue-100",
  receipt: "text-green-700 bg-green-50 border-green-100",
};

interface ChainRow {
  source: DocumentSummary;
  hasQuote: boolean;
  hasInvoice: boolean;
  hasReceipt: boolean;
}

export default function DocumentPicker({
  open,
  targetType,
  onClose,
  onPick,
  onCreateBlank,
}: Props) {
  const { user } = useAuth();
  const [allDocs, setAllDocs] = useState<DocumentSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { onBackdropClick } = useModalDismiss(onClose, { open: open && !busy });

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const docs = await listDocuments();
        if (!cancelled) setAllDocs(docs);
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const rows = useMemo<ChainRow[]>(() => {
    if (allDocs.length === 0) return [];
    // Build forward chain map: id -> direct children
    const children = new Map<string, DocumentSummary[]>();
    for (const d of allDocs) {
      if (!d.linkedFromId) continue;
      const arr = children.get(d.linkedFromId) ?? [];
      arr.push(d);
      children.set(d.linkedFromId, arr);
    }

    const walkChain = (root: DocumentSummary): DocumentSummary[] => {
      const out: DocumentSummary[] = [root];
      const stack = [root.id];
      while (stack.length > 0) {
        const id = stack.pop()!;
        const kids = children.get(id) ?? [];
        for (const k of kids) {
          out.push(k);
          stack.push(k.id);
        }
      }
      return out;
    };

    // For invoice picker: source must be quote (no parent). Source = chain root quote.
    // For receipt picker: source = chain that doesn't yet end at a receipt; root may be quote or invoice without parent.
    const eligibleRoots = allDocs.filter((d) => {
      if (d.linkedFromId) return false;
      if (targetType === "invoice") return d.type === "quote";
      return d.type === "quote" || d.type === "invoice";
    });

    const result: ChainRow[] = eligibleRoots.map((root) => {
      const chain = walkChain(root);
      return {
        source: root,
        hasQuote: chain.some((d) => d.type === "quote"),
        hasInvoice: chain.some((d) => d.type === "invoice"),
        hasReceipt: chain.some((d) => d.type === "receipt"),
      };
    });

    return result;
  }, [allDocs, targetType]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (r) =>
          r.source.number.toLowerCase().includes(q) ||
          r.source.projectName.toLowerCase().includes(q) ||
          r.source.customerName.toLowerCase().includes(q)
      )
    : rows;

  if (!open || typeof document === "undefined") return null;

  const targetLabel = TYPE_LABELS[targetType];

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-xl shadow-soft-lg flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
          <div>
            <h3 className="font-semibold text-ink-900">
              สร้าง{targetLabel}
            </h3>
            <div className="text-xs text-ink-400 mt-0.5">
              เลือกเอกสารต้นทาง หรือเริ่มจากใหม่
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50 disabled:opacity-50"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-orange-100 space-y-2">
          <button
            onClick={async () => {
              setBusy(true);
              try {
                await onCreateBlank();
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 disabled:bg-ink-400 text-white text-sm font-medium transition shadow-soft"
          >
            <Plus size={14} />
            สร้าง{targetLabel}ใหม่ (กรอกข้อมูลเอง)
          </button>
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา เลขที่ ชื่อโครงการ ลูกค้า"
              className="w-full pl-9 pr-3 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {!user ? (
            <div className="text-center py-12 px-6 text-sm text-ink-600">
              ต้องเข้าสู่ระบบก่อนถึงจะเลือกจากเอกสารเดิมได้
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-xs text-ink-400">
              กำลังโหลด...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 text-brand-300 flex items-center justify-center mb-3">
                <FileText size={18} />
              </div>
              <div className="text-sm text-ink-700 font-medium">
                {q
                  ? "ไม่พบเอกสารที่ค้นหา"
                  : targetType === "invoice"
                  ? "ยังไม่มีใบเสนอราคา"
                  : "ยังไม่มีใบเสนอราคา/ใบแจ้งหนี้"}
              </div>
              <div className="text-xs text-ink-400 mt-1">
                กดปุ่ม &ldquo;สร้าง{targetLabel}ใหม่&rdquo; ด้านบนได้เลย
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-orange-100">
              {filtered.map((r) => {
                const SrcIcon = TYPE_ICONS[r.source.type];
                return (
                  <li key={r.source.id}>
                    <button
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await onPick(r.source.id);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-orange-50/40 transition disabled:opacity-50"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                          TYPE_COLOR[r.source.type]
                        }`}
                      >
                        <SrcIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-ink-500 shrink-0">
                            {r.source.number}
                          </span>
                          <span className="text-sm font-medium text-ink-900 truncate">
                            {r.source.projectName ||
                              r.source.customerName ||
                              "—"}
                          </span>
                        </div>
                        {(r.source.customerName || r.source.projectName) && (
                          <div className="text-xs text-ink-400 truncate mt-0.5">
                            {r.source.customerName || "ไม่ระบุลูกค้า"}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <StatusBadge done={r.hasQuote} label="QT" />
                          <StatusBadge done={r.hasInvoice} label="IV" />
                          <StatusBadge done={r.hasReceipt} label="RE" />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatusBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
        done
          ? "bg-green-50 text-green-700 border-green-100"
          : "bg-ink-50 text-ink-400 border-ink-100"
      }`}
    >
      {done && <Check size={9} strokeWidth={3} />}
      {label}
    </span>
  );
}
