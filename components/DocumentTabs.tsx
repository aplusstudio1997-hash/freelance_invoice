"use client";

import { useState } from "react";
import { FileText, FileCheck2, Receipt, FolderOpen } from "lucide-react";
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
  const { activeType, switchType, newDocument } = useDocuments();
  const [listOpen, setListOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onPick = async (t: DocumentType) => {
    setMobileOpen(false);
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

  return (
    <>
      <div className="hidden md:flex items-center gap-1 border-b border-gray-200 bg-white px-3 sm:px-4">
        {(Object.keys(TYPE_LABELS) as DocumentType[]).map((t) => {
          const Icon = TYPE_ICONS[t];
          const active = activeType === t;
          return (
            <button
              key={t}
              onClick={() => onPick(t)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                active
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon size={14} />
              {TYPE_LABELS[t]}
            </button>
          );
        })}
        <div className="ml-auto py-1.5">
          <button
            onClick={() => setListOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded transition"
          >
            <FolderOpen size={14} />
            <span>เอกสารของฉัน</span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
          {(() => {
            const Icon = TYPE_ICONS[activeType];
            return <Icon size={14} className="text-brand-500" />;
          })()}
          {TYPE_LABELS[activeType]}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setListOpen(true)}
            className="text-xs text-gray-600 hover:text-brand-600 px-2 py-1 rounded border border-gray-200"
          >
            <FolderOpen size={12} className="inline mr-1" />
            เอกสารของฉัน
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-xs text-brand-600 hover:bg-brand-50 px-2 py-1 rounded border border-brand-200"
          >
            เอกสารอื่น
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white rounded-t-xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">
                เลือกประเภทเอกสาร
              </h3>
            </div>
            <div className="p-2">
              {(Object.keys(TYPE_LABELS) as DocumentType[]).map((t) => {
                const Icon = TYPE_ICONS[t];
                const active = activeType === t;
                return (
                  <button
                    key={t}
                    onClick={() => onPick(t)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm ${
                      active
                        ? "bg-brand-50 text-brand-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />
                    {TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

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
