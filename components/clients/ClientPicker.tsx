"use client";

import { useEffect, useRef, useState } from "react";
import { useDocuments } from "@/lib/documents";
import { ChevronDown, UserPlus, Check, X, Save } from "lucide-react";

export default function ClientPicker() {
  const {
    clients,
    activeClientId,
    attachClient,
    saveCurrentCustomerAsClient,
    data,
  } = useDocuments();

  const [open, setOpen] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = clients.find((c) => c.id === activeClientId);
  const customerName = data.customer?.name?.trim() || "";
  const matched = customerName
    ? clients.find(
        (c) => c.name.toLowerCase().trim() === customerName.toLowerCase()
      )
    : null;

  const showSaveNewBtn = !active && customerName && !matched;

  const onPick = async (id: string | null) => {
    setOpen(false);
    await attachClient(id, id !== null);
  };

  const onSaveNew = async () => {
    setSavingNew(true);
    try {
      await saveCurrentCustomerAsClient();
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-ink-700">
          เลือกลูกค้าจาก CRM
        </label>
        {active && (
          <button
            onClick={() => onPick(null)}
            className="text-xs text-ink-400 hover:text-red-500 inline-flex items-center gap-1 transition"
          >
            <X size={10} />
            เลิกผูก
          </button>
        )}
      </div>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full px-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 flex items-center justify-between hover:bg-white transition"
        >
          <span className={active ? "text-ink-900" : "text-ink-400"}>
            {active ? active.name : "— เลือกหรือใช้ข้อมูลด้านล่าง —"}
          </span>
          <ChevronDown
            size={14}
            className={`text-ink-400 transition ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-100 rounded-2xl shadow-soft-lg z-50 max-h-72 overflow-y-auto scrollbar-thin">
            {clients.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-ink-400">
                ยังไม่มีลูกค้าในระบบ
                <br />
                เพิ่มได้ในหน้า Clients
              </div>
            ) : (
              <>
                <button
                  onClick={() => onPick(null)}
                  className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 text-ink-400 italic"
                >
                  ไม่ผูกกับ CRM (กรอกข้อมูลเอง)
                </button>
                <div className="border-t border-orange-100" />
                {clients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onPick(c.id)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-orange-50 flex items-center gap-2 text-sm transition"
                  >
                    {c.id === activeClientId && (
                      <Check size={12} className="text-brand-500 shrink-0" />
                    )}
                    <span
                      className={`flex-1 min-w-0 truncate ${
                        c.id === activeClientId
                          ? "text-brand-700 font-medium"
                          : "text-ink-800"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="text-xs text-ink-400 shrink-0">
                      {c.documentCount} เอกสาร
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {matched && !active && (
        <button
          onClick={() => onPick(matched.id)}
          className="w-full text-xs px-3 py-2 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 hover:bg-brand-100 transition flex items-center justify-center gap-1.5"
        >
          <Check size={11} />
          ลูกค้านี้มีใน CRM อยู่แล้ว — กดเพื่อผูก
        </button>
      )}

      {showSaveNewBtn && (
        <button
          onClick={onSaveNew}
          disabled={savingNew}
          className="w-full text-xs px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-brand-700 hover:bg-orange-100 transition disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {savingNew ? (
            <>กำลังบันทึก...</>
          ) : (
            <>
              <UserPlus size={11} />
              บันทึก &ldquo;{customerName}&rdquo; เป็นลูกค้าใหม่
            </>
          )}
        </button>
      )}

      {active && (
        <div className="text-xs text-ink-400 bg-orange-50/30 border border-orange-100 rounded-xl px-3 py-2 flex items-start gap-1.5">
          <Save size={11} className="mt-0.5 text-brand-500 shrink-0" />
          เอกสารผูกกับ &ldquo;{active.name}&rdquo; — ข้อมูลด้านล่างจะถูกใช้ในเอกสารใบนี้
        </div>
      )}
    </div>
  );
}
