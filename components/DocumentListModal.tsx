"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  FileText,
  FileCheck2,
  Receipt,
  Loader2,
  Search,
  User,
} from "lucide-react";
import { DocumentType } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useDocuments } from "@/lib/documents";
import { DocumentSummary, listDocuments } from "@/lib/repository";

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

const TYPE_COLORS: Record<DocumentType, string> = {
  quote: "bg-orange-50 text-brand-700 border-brand-100",
  invoice: "bg-blue-50 text-blue-700 border-blue-100",
  receipt: "bg-green-50 text-green-700 border-green-100",
};

interface Props {
  onClose: () => void;
  filterType: DocumentType;
  onCreateNew: (type: DocumentType, sourceId?: string) => Promise<void>;
}

export default function DocumentListModal({
  onClose,
  filterType,
  onCreateNew,
}: Props) {
  const { user } = useAuth();
  const { documents, openDocument, deleteDocument, clients } = useDocuments();
  const [picking, setPicking] = useState(false);
  const [quoteList, setQuoteList] = useState<DocumentSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if ((filterType === "invoice" || filterType === "receipt") && user) {
      (async () => {
        try {
          const docs = await listDocuments();
          setQuoteList(
            docs.filter(
              (d) =>
                d.type === "quote" ||
                (filterType === "receipt" && d.type === "invoice")
            )
          );
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [filterType, user]);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-soft-lg">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-ink-900">เอกสารของฉัน</h3>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-700"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-ink-600">
            ต้องเข้าสู่ระบบก่อนถึงจะดู/บันทึกเอกสารหลายใบได้
          </p>
        </div>
      </div>
    );
  }

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  const q = search.trim().toLowerCase();
  const filteredDocs = documents
    .filter((d) => d.type === filterType)
    .filter(
      (d) =>
        !q ||
        d.number.toLowerCase().includes(q) ||
        d.projectName.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q)
    );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-xl shadow-soft-lg flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
          <div>
            <h3 className="font-semibold text-ink-900">
              {TYPE_LABELS[filterType]} ของฉัน
            </h3>
            <div className="text-[11px] text-ink-400 mt-0.5">
              {filteredDocs.length} ฉบับ
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา เลขที่ ชื่อโครงการ หรือลูกค้า"
              className="w-full pl-9 pr-3.5 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
          {!picking && filterType !== "quote" && (
            <button
              onClick={() => setPicking(true)}
              className="w-full mb-3 flex items-center justify-center gap-2 border border-dashed border-brand-300 hover:border-brand-500 hover:bg-orange-50 text-brand-700 rounded-2xl px-3 py-3 text-sm font-medium transition"
            >
              <Plus size={14} />
              สร้าง{TYPE_LABELS[filterType]}ใหม่จาก
              {filterType === "invoice"
                ? "ใบเสนอราคา"
                : "ใบเสนอราคา/ใบแจ้งหนี้"}
            </button>
          )}

          {!picking && filterType === "quote" && (
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  await onCreateNew("quote");
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="w-full mb-3 flex items-center justify-center gap-2 border border-dashed border-brand-300 hover:border-brand-500 hover:bg-orange-50 text-brand-700 rounded-2xl px-3 py-3 text-sm font-medium transition disabled:opacity-50"
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              สร้างใบเสนอราคาใหม่
            </button>
          )}

          {picking && (
            <div className="mb-3 border border-orange-100 rounded-2xl bg-orange-50/40 p-3">
              <div className="text-xs font-medium text-ink-700 mb-2">
                เลือกเอกสารที่จะใช้เป็นต้นทาง
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                {quoteList.length === 0 && (
                  <div className="text-xs text-ink-400 py-4 text-center">
                    ยังไม่มีเอกสารต้นทางในระบบ
                  </div>
                )}
                {quoteList.map((q2) => {
                  const QIcon = TYPE_ICONS[q2.type];
                  return (
                    <button
                      key={q2.id}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await onCreateNew(filterType, q2.id);
                          setPicking(false);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-xs hover:bg-white rounded-xl disabled:opacity-50 transition"
                    >
                      <QIcon size={12} className="text-brand-400 shrink-0" />
                      <span className="font-mono text-[11px] text-ink-500 shrink-0">
                        {q2.number}
                      </span>
                      <span className="truncate text-ink-800">
                        {q2.projectName || q2.customerName || "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPicking(false)}
                className="mt-2 text-xs text-ink-500 hover:text-ink-700"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {filteredDocs.length === 0 && !picking && (
            <div className="text-center py-10">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 text-brand-300 flex items-center justify-center mb-2">
                {(() => {
                  const Icon = TYPE_ICONS[filterType];
                  return <Icon size={20} />;
                })()}
              </div>
              <div className="text-sm text-ink-600">
                {search ? "ไม่พบเอกสารที่ค้นหา" : "ยังไม่มีเอกสารในรายการ"}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {filteredDocs.map((d) => {
              const Icon = TYPE_ICONS[d.type];
              const clientName = d.clientId ? clientMap.get(d.clientId) : null;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-2 border border-orange-100 hover:border-brand-200 hover:bg-orange-50/40 rounded-2xl p-3 group transition"
                >
                  <button
                    onClick={async () => {
                      await openDocument(d.id);
                      onClose();
                    }}
                    className="flex-1 min-w-0 flex items-center gap-2.5 text-left"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                        TYPE_COLORS[d.type]
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] text-ink-500 shrink-0">
                          {d.number}
                        </span>
                        <span className="text-sm font-medium text-ink-900 truncate">
                          {d.projectName || d.customerName || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-400 mt-0.5">
                        {clientName && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-50 text-brand-700 font-medium">
                            <User size={9} />
                            {clientName}
                          </span>
                        )}
                        <span>
                          {new Date(d.updatedAt).toLocaleDateString("th-TH")}
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        confirm(
                          `ลบ ${d.number} ออกจากระบบ? ทำแล้วเรียกคืนไม่ได้`
                        )
                      ) {
                        await deleteDocument(d.id);
                      }
                    }}
                    className="text-ink-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition shrink-0"
                    aria-label="ลบ"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
