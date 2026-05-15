"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/lib/documents";
import {
  ClientRecord,
  createClient,
  deleteClient,
  getClient,
  updateClient,
} from "@/lib/repository";
import { Customer } from "@/lib/types";
import ClientFormModal, {
  ClientFormData,
} from "@/components/clients/ClientFormModal";
import ClientDetailModal from "@/components/clients/ClientDetailModal";
import {
  Users,
  Plus,
  Search,
  FileText,
  Mail,
  Phone,
  Loader2,
  UserPlus,
} from "lucide-react";

export default function ClientsPage() {
  const router = useRouter();
  const { clients, refreshClients, openDocument } = useDocuments();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientRecord | null>(null);
  const [detailClient, setDetailClient] = useState<ClientRecord | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    refreshClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.taxId.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const total = clients.length;
  const docCount = clients.reduce((acc, c) => acc + c.documentCount, 0);

  const onOpenDetail = async (id: string) => {
    setLoadingId(id);
    try {
      const rec = await getClient(id);
      if (rec) setDetailClient(rec);
    } finally {
      setLoadingId(null);
    }
  };

  const formDataToCustomer = (f: ClientFormData): Customer => ({
    name: f.name,
    phone: f.phone,
    email: f.email,
    lineId: f.lineId,
    address: f.address,
    taxId: f.taxId,
  });

  const handleCreate = async (f: ClientFormData) => {
    await createClient(formDataToCustomer(f), f.note);
    await refreshClients();
  };

  const handleUpdate = async (f: ClientFormData) => {
    if (!editClient) return;
    await updateClient(editClient.id, {
      ...formDataToCustomer(f),
      note: f.note,
    });
    await refreshClients();
    const updated = await getClient(editClient.id);
    if (updated) setDetailClient(updated);
    setEditClient(null);
  };

  const handleDelete = async () => {
    if (!detailClient) return;
    await deleteClient(detailClient.id);
    await refreshClients();
    setDetailClient(null);
  };

  const handleOpenDocument = async (id: string) => {
    setDetailClient(null);
    await openDocument(id);
    router.push("/app/finance");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink-900">Clients CRM</h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              จัดการลูกค้าและประวัติงาน — เลือกใช้ในเอกสารใหม่ได้ทันที
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-xs font-medium transition shadow-soft"
          >
            <Plus size={13} />
            เพิ่มลูกค้า
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <SmallStat label="ลูกค้าทั้งหมด" value={String(total)} />
          <SmallStat label="เอกสารทั้งหมด" value={String(docCount)} />
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า อีเมล โทรศัพท์ หรือเลขประจำตัวผู้เสียภาษี"
            className="w-full pl-10 pr-4 py-2.5 bg-orange-50/40 border border-orange-100 rounded-full text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 text-center py-10">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-50 text-brand-300 flex items-center justify-center mb-3">
              <UserPlus size={22} />
            </div>
            <div className="text-sm font-medium text-ink-700">
              {search ? "ไม่พบลูกค้าที่ค้นหา" : "ยังไม่มีลูกค้าในระบบ"}
            </div>
            <div className="text-xs text-ink-400 mt-1">
              {search
                ? "ลองค้นหาด้วยคำอื่น"
                : "กดปุ่ม “เพิ่มลูกค้า” เพื่อเริ่มต้น"}
            </div>
            {!search && (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition shadow-soft"
              >
                <Plus size={13} />
                เพิ่มลูกค้าใหม่
              </button>
            )}
          </div>
        ) : (
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenDetail(c.id)}
                disabled={loadingId === c.id}
                className="text-left p-4 rounded-2xl border border-orange-100 hover:border-brand-200 hover:bg-orange-50/40 transition group disabled:opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {loadingId === c.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      (c.name[0] || "U").toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900 text-sm truncate group-hover:text-brand-700 transition">
                      {c.name}
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1 text-xs text-ink-400 mt-0.5 truncate">
                        <Mail size={10} />
                        {c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1 text-xs text-ink-400 mt-0.5 truncate">
                        <Phone size={10} />
                        {c.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-100/70 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-ink-500">
                    <FileText size={11} />
                    {c.documentCount} เอกสาร
                  </span>
                  <span className="text-brand-600 font-medium">ดูรายละเอียด →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <ClientFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
      />
      <ClientFormModal
        open={!!editClient}
        initial={editClient}
        onClose={() => setEditClient(null)}
        onSubmit={handleUpdate}
      />
      {detailClient && (
        <ClientDetailModal
          client={detailClient}
          onClose={() => setDetailClient(null)}
          onEdit={() => {
            setEditClient(detailClient);
          }}
          onDelete={handleDelete}
          onOpenDocument={handleOpenDocument}
        />
      )}
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-4 py-2.5">
      <div className="text-xs text-ink-400 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-bold text-ink-900 tabular-nums mt-0.5">
        {value}
      </div>
    </div>
  );
}
