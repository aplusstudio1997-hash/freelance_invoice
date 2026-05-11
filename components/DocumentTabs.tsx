"use client";

import { useState } from "react";
import { FileText, FileCheck2, Receipt, FolderOpen, Plus } from "lucide-react";
import { DocumentType } from "@/lib/types";
import { useDocuments } from "@/lib/documents";
import { useAuth } from "@/lib/auth";
import DocumentListModal from "./DocumentListModal";

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

export default function DocumentTabs() {
  const { user } = useAuth();
  const { activeType, switchType, newDocument, data, documents, activeId } =
    useDocuments();
  const [listOpen, setListOpen] = useState(false);

  const current = documents.find((d) => d.id === activeId);

  const onPick = async (t: DocumentType) => {
    if (t === activeType) return;
    if (!user) {
      switchType(t);
      return;
    }
    if (t === "quote") {
      switchType(t);
    } else {
      setListOpen(true);
      switchType(t);
    }
  };

  const onNewQuote = async () => {
    if (user) {
      await newDocument("quote");
    } else {
      switchType("quote");
    }
  };

  return (
    <>
      <div className="border-b border-orange-100 bg-gradient-to-b from-orange-50/40 to-transparent px-3 sm:px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="text-xs text-ink-400">เอกสารปัจจุบัน</div>
            <div className="font-semibold text-ink-900 text-sm truncate">
              {current?.number ||
                data.quoteNumber ||
                "ยังไม่มีเอกสาร — เริ่มสร้างใหม่ได้เลย"}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onNewQuote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition shadow-soft"
              title="สร้างใบเสนอราคาใหม่"
            >
              <Plus size={12} />
              <span className="hidden sm:inline">ใหม่</span>
            </button>
            <button
              onClick={() => setListOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-orange-200 hover:border-brand-300 hover:bg-orange-50 text-ink-700 text-xs font-medium transition"
            >
              <FolderOpen size={12} />
              <span className="hidden sm:inline">เอกสารของฉัน</span>
              <span className="sm:hidden">{documents.length}</span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-orange-100 rounded-full p-1 inline-flex items-center gap-0.5 shadow-soft max-w-full overflow-x-auto scrollbar-thin">
          {(Object.keys(TYPE_LABELS) as DocumentType[]).map((t) => {
            const Icon = TYPE_ICONS[t];
            const active = activeType === t;
            return (
              <button
                key={t}
                onClick={() => onPick(t)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                  active
                    ? "bg-ink-900 text-white shadow-soft"
                    : "text-ink-600 hover:text-ink-900 hover:bg-orange-50"
                }`}
              >
                <Icon size={12} />
                {TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {listOpen && (
        <DocumentListModal
          onClose={() => setListOpen(false)}
          filterType={activeType}
          onCreateNew={async (type, sourceId) => {
            await newDocument(type, sourceId);
            setListOpen(false);
          }}
        />
      )}
    </>
  );
}
