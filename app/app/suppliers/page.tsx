"use client";

import { useEffect, useState, useMemo } from "react";
import {
  SupplierRecord,
  SupplierCategory,
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  SupplierInput,
} from "@/lib/suppliers";
import SupplierFormModal, {
  SUPPLIER_CATEGORIES,
} from "@/components/suppliers/SupplierFormModal";
import SupplierDetailModal from "@/components/suppliers/SupplierDetailModal";
import {
  Briefcase,
  Plus,
  Search,
  Mail,
  Phone,
  Paperclip,
  Loader2,
  Filter,
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRecord | null>(null);
  const [detail, setDetail] = useState<SupplierRecord | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<SupplierCategory | "all">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await listSuppliers();
      setSuppliers(list);
      if (detail) {
        const updated = list.find((s) => s.id === detail.id);
        if (updated) setDetail(updated);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (catFilter !== "all" && s.category !== catFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.service_type.toLowerCase().includes(q) ||
        s.note.toLowerCase().includes(q)
      );
    });
  }, [suppliers, search, catFilter]);

  const totalFiles = useMemo(
    () => suppliers.reduce((acc, s) => acc + s.files.length, 0),
    [suppliers]
  );

  const byCategory = useMemo(() => {
    const m = new Map<SupplierCategory, number>();
    suppliers.forEach((s) => {
      m.set(s.category, (m.get(s.category) || 0) + 1);
    });
    return Array.from(m.entries())
      .map(([cat, count]) => ({ cat, count }))
      .sort((a, b) => b.count - a.count);
  }, [suppliers]);

  const openDetail = async (id: string) => {
    setLoadingId(id);
    try {
      const rec = await getSupplier(id);
      if (rec) setDetail(rec);
    } finally {
      setLoadingId(null);
    }
  };

  const onCreate = async (data: SupplierInput) => {
    await createSupplier(data);
    await refresh();
  };

  const onUpdate = async (data: SupplierInput) => {
    if (!editing) return;
    await updateSupplier(editing.id, data);
    setEditing(null);
    await refresh();
  };

  const onDelete = async () => {
    if (!detail) return;
    await deleteSupplier(detail.id);
    setDetail(null);
    await refresh();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
            <Briefcase size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink-900">Suppliers Hub</h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              จดบันทึก supplier และไฟล์ตัวอย่างงาน — คลังอ้างอิงสำหรับเสนองาน
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-soft"
          >
            <Plus size={13} />
            เพิ่ม Supplier
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label="Suppliers ทั้งหมด" value={String(suppliers.length)} />
          <Stat
            label="หมวดเยอะสุด"
            value={
              byCategory[0]
                ? SUPPLIER_CATEGORIES[byCategory[0].cat]
                : "—"
            }
          />
          <Stat label="ไฟล์ทั้งหมด" value={String(totalFiles)} />
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่อ อีเมล โทรศัพท์ ประเภทบริการ หรือหมายเหตุ"
              className="w-full pl-9 pr-3.5 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
          <div className="relative">
            <Filter
              size={12}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
            />
            <select
              value={catFilter}
              onChange={(e) =>
                setCatFilter(e.target.value as SupplierCategory | "all")
              }
              className="pl-9 pr-8 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white appearance-none cursor-pointer"
            >
              <option value="all">ทุกหมวด</option>
              {Object.entries(SUPPLIER_CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">
            <Loader2 size={14} className="animate-spin mr-2" />
            กำลังโหลด...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Briefcase size={22} />
            </div>
            <div className="text-sm font-medium text-ink-700">
              {search || catFilter !== "all"
                ? "ไม่พบ Supplier ที่ค้นหา"
                : "ยังไม่มี Supplier ในระบบ"}
            </div>
            {!search && catFilter === "all" && (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-soft"
              >
                <Plus size={12} />
                เพิ่ม Supplier
              </button>
            )}
          </div>
        ) : (
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => openDetail(s.id)}
                disabled={loadingId === s.id}
                className="text-left p-4 rounded-2xl border border-orange-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition group disabled:opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {loadingId === s.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      (s.name[0] || "S").toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900 text-sm truncate group-hover:text-emerald-700 transition">
                      {s.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                        {SUPPLIER_CATEGORIES[s.category]}
                      </span>
                      {s.service_type && (
                        <span className="text-xs text-ink-400 truncate">
                          {s.service_type}
                        </span>
                      )}
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-1 text-xs text-ink-400 mt-1 truncate">
                        <Mail size={10} />
                        {s.email}
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-1 text-xs text-ink-400 mt-0.5 truncate">
                        <Phone size={10} />
                        {s.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-100/70 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-ink-500">
                    <Paperclip size={11} />
                    {s.files.length} ไฟล์
                  </span>
                  <span className="text-emerald-700 font-medium">
                    ดูรายละเอียด →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <SupplierFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={onCreate}
      />
      <SupplierFormModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={onUpdate}
      />
      {detail && (
        <SupplierDetailModal
          supplier={detail}
          onClose={() => setDetail(null)}
          onEdit={() => setEditing(detail)}
          onDelete={onDelete}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-3 py-2.5">
      <div className="text-xs text-ink-400 uppercase tracking-wide truncate">
        {label}
      </div>
      <div className="text-base font-bold text-ink-900 tabular-nums truncate mt-0.5">
        {value}
      </div>
    </div>
  );
}
