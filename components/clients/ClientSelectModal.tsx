"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDocuments } from "@/lib/documents";
import { X, Search, UserPlus, User, CheckCircle2 } from "lucide-react";
import ClientFormModal from "./ClientFormModal";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ClientSelectModal({ open, onClose }: Props) {
  const { clients, activeClientId, attachClient, refreshClients } =
    useDocuments();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const { onBackdropClick } = useModalDismiss(onClose, { open: open && !addOpen });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [clients, search]);

  if (!open || typeof document === "undefined") return null;

  const pick = async (id: string) => {
    await attachClient(id);
    onClose();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
        onClick={onBackdropClick}
      >
        <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-lg shadow-soft-lg max-h-[92vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-500 flex items-center justify-center">
                <User size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900">เลือกลูกค้า</h3>
                <div className="text-xs text-ink-400">
                  เลือกจากรายการ หรือเพิ่มลูกค้าใหม่
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-3 border-b border-orange-100 space-y-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหา ชื่อ อีเมล โทรศัพท์"
                className="w-full pl-9 pr-3 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
              />
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-medium transition shadow-soft"
            >
              <UserPlus size={14} />
              เพิ่มลูกค้าใหม่
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 text-brand-300 flex items-center justify-center mb-3">
                  <User size={18} />
                </div>
                <div className="text-sm text-ink-700 font-medium">
                  {search ? "ไม่พบลูกค้าที่ค้นหา" : "ยังไม่มีลูกค้า"}
                </div>
                <div className="text-xs text-ink-400 mt-1">
                  กดปุ่ม &ldquo;เพิ่มลูกค้าใหม่&rdquo; ด้านบน
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-orange-100">
                {filtered.map((c) => {
                  const isActive = c.id === activeClientId;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => pick(c.id)}
                        className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-orange-50/40 text-left transition ${
                          isActive ? "bg-orange-50/60" : ""
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isActive
                              ? "bg-brand-500 text-white"
                              : "bg-gradient-to-br from-brand-100 to-orange-100 text-brand-700"
                          }`}
                        >
                          {(c.name[0] || "?").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink-900 text-sm truncate">
                            {c.name}
                          </div>
                          <div className="text-xs text-ink-400 truncate">
                            {c.email || c.phone || c.taxId || "—"}
                          </div>
                        </div>
                        {isActive && (
                          <CheckCircle2
                            size={16}
                            className="text-brand-500 shrink-0"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ClientFormModal
        open={addOpen}
        initial={null}
        onClose={() => setAddOpen(false)}
        onSubmit={async (f) => {
          const { createClient } = await import("@/lib/repository");
          const customer = {
            name: f.name,
            phone: f.phone,
            email: f.email,
            lineId: f.lineId,
            address: f.address,
            taxId: f.taxId,
          };
          const rec = await createClient(customer, f.note);
          await refreshClients();
          await attachClient(rec.id);
          setAddOpen(false);
          onClose();
        }}
      />
    </>,
    document.body
  );
}
