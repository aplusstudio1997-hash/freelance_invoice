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
  const { documents, openDocument, deleteDocument } = useDocuments();
  const [picking, setPicking] = useState(false);
  const [quoteList, setQuoteList] = useState<DocumentSummary[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if ((filterType === "invoice" || filterType === "receipt") && user) {
      (async () => {
        try {
          const docs = await listDocuments();
          setQuoteList(docs.filter((d) => d.type === "quote" || (filterType === "receipt" && d.type === "invoice")));
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [filterType, user]);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-800">
              เอกสารของฉัน
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            ต้องเข้าสู่ระบบก่อนถึงจะดู/บันทึกเอกสารหลายใบได้
          </p>
        </div>
      </div>
    );
  }

  const filteredDocs = documents.filter((d) => d.type === filterType);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white sm:rounded-xl rounded-t-xl w-full sm:max-w-lg shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {TYPE_LABELS[filterType]} ของฉัน
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {!picking && filterType !== "quote" && (
            <button
              onClick={() => setPicking(true)}
              className="w-full mb-3 flex items-center gap-2 border border-dashed border-brand-300 hover:border-brand-500 hover:bg-brand-50 text-brand-600 rounded-lg px-3 py-3 text-sm font-medium"
            >
              <Plus size={16} />
              สร้าง{TYPE_LABELS[filterType]}ใหม่จาก{filterType === "invoice" ? "ใบเสนอราคา" : "ใบเสนอราคา/ใบแจ้งหนี้"}
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
              className="w-full mb-3 flex items-center justify-center gap-2 border border-dashed border-brand-300 hover:border-brand-500 hover:bg-brand-50 text-brand-600 rounded-lg px-3 py-3 text-sm font-medium disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
              สร้างใบเสนอราคาใหม่
            </button>
          )}

          {picking && (
            <div className="mb-3 border border-gray-200 rounded-lg bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-700 mb-2">
                เลือกเอกสารที่จะใช้เป็นต้นทาง
              </div>
              <div className="space-y-1">
                {quoteList.length === 0 && (
                  <div className="text-xs text-gray-500 py-3 text-center">
                    ยังไม่มีเอกสารต้นทางในระบบ
                  </div>
                )}
                {quoteList.map((q) => {
                  const QIcon = TYPE_ICONS[q.type];
                  return (
                    <button
                      key={q.id}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await onCreateNew(filterType, q.id);
                          setPicking(false);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      className="w-full flex items-center gap-2 px-2 py-2 text-left text-xs hover:bg-white rounded disabled:opacity-50"
                    >
                      <QIcon size={12} className="text-gray-400 shrink-0" />
                      <span className="font-mono text-[11px] text-gray-500 shrink-0">
                        {q.number}
                      </span>
                      <span className="truncate text-gray-700">
                        {q.projectName || q.customerName || "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPicking(false)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {filteredDocs.length === 0 && !picking && (
            <div className="text-center text-sm text-gray-400 py-8">
              ยังไม่มีเอกสารในรายการ
            </div>
          )}

          <div className="space-y-1.5">
            {filteredDocs.map((d) => {
              const Icon = TYPE_ICONS[d.type];
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-2 border border-gray-200 hover:border-brand-300 rounded-lg p-3 group"
                >
                  <button
                    onClick={async () => {
                      await openDocument(d.id);
                      onClose();
                    }}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left"
                  >
                    <Icon size={14} className="text-gray-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500 shrink-0">
                          {d.number}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {d.projectName || d.customerName || "—"}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {d.customerName && d.projectName
                          ? d.customerName + " · "
                          : ""}
                        {new Date(d.updatedAt).toLocaleDateString("th-TH")}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        confirm(`ลบ ${d.number} ออกจากระบบ? ทำแล้วเรียกคืนไม่ได้`)
                      ) {
                        await deleteDocument(d.id);
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition"
                    aria-label="ลบ"
                  >
                    <Trash2 size={14} />
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
