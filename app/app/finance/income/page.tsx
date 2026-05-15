"use client";

import { useEffect, useState, useMemo } from "react";
import { useDocuments } from "@/lib/documents";
import {
  IncomeRecord,
  listIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "@/lib/finance";
import {
  INCOME_CATEGORIES,
  THAI_MONTHS,
  fmtMoney,
  fmtDateDisplay,
  downloadCsv,
} from "@/lib/finance-utils";
import IncomeFormModal from "@/components/finance/IncomeFormModal";
import {
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Download,
  User,
  Loader2,
} from "lucide-react";

export default function IncomePage() {
  const { clients } = useDocuments();
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeRecord | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await listIncomes(`${year}-01-01`, `${year}-12-31`);
      setIncomes(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const filtered = useMemo(() => {
    return incomes.filter((i) => {
      const d = new Date(i.received_at);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [incomes, year, month]);

  const monthStats = useMemo(() => {
    const gross = filtered.reduce((a, i) => a + Number(i.amount), 0);
    const wht = filtered.reduce((a, i) => a + Number(i.wht_amount), 0);
    const vat = filtered.reduce((a, i) => a + Number(i.vat_amount), 0);
    return { gross, wht, vat, net: gross - wht };
  }, [filtered]);

  const yearStats = useMemo(() => {
    const gross = incomes.reduce((a, i) => a + Number(i.amount), 0);
    const wht = incomes.reduce((a, i) => a + Number(i.wht_amount), 0);
    return { gross, wht };
  }, [incomes]);

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  const onCreate = async (data: Parameters<typeof createIncome>[0]) => {
    await createIncome(data);
    await refresh();
  };

  const onUpdate = async (data: Parameters<typeof createIncome>[0]) => {
    if (!editing) return;
    await updateIncome(editing.id, data);
    setEditing(null);
    await refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("ลบรายรับนี้?")) return;
    await deleteIncome(id);
    await refresh();
  };

  const exportCsv = () => {
    const rows: string[][] = [
      ["วันที่", "รายละเอียด", "หมวด", "ลูกค้า", "จำนวนรับ", "WHT 3%", "VAT", "สุทธิ"],
      ...filtered.map((i) => [
        i.received_at,
        i.description,
        INCOME_CATEGORIES[i.category]?.label || i.category,
        i.client_id ? clientMap.get(i.client_id) || "" : "",
        String(i.amount),
        String(i.wht_amount),
        String(i.vat_amount),
        String(Number(i.amount) - Number(i.wht_amount)),
      ]),
      ["", "", "", "รวม", String(monthStats.gross), String(monthStats.wht), String(monthStats.vat), String(monthStats.net)],
    ];
    downloadCsv(`income-${year}-${String(month).padStart(2, "0")}.csv`, rows);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-orange-50/40 border border-orange-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white"
            >
              {[year - 2, year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y + 543}
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-orange-50/40 border border-orange-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white"
            >
              {THAI_MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 text-ink-700 hover:bg-orange-50 disabled:opacity-50 text-xs font-medium transition"
            >
              <Download size={12} />
              CSV
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition shadow-soft"
            >
              <Plus size={12} />
              บันทึกรายรับ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <Stat label="รับรวมเดือนนี้" value={`฿${fmtMoney(monthStats.gross)}`} tone="positive" />
          <Stat label="หัก WHT 3%" value={`฿${fmtMoney(monthStats.wht)}`} />
          <Stat label="สุทธิเดือนนี้" value={`฿${fmtMoney(monthStats.net)}`} tone="positive" />
          <Stat
            label={`รับรวมปี ${year + 543}`}
            value={`฿${fmtMoney(yearStats.gross)}`}
          />
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">
            <Loader2 size={14} className="animate-spin mr-2" />
            กำลังโหลด...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
              <TrendingUp size={22} />
            </div>
            <div className="text-sm font-medium text-ink-700">
              ยังไม่มีรายรับใน{THAI_MONTHS[month - 1]} {year + 543}
            </div>
            <div className="text-xs text-ink-400 mt-1">
              กดปุ่ม &ldquo;บันทึกรายรับ&rdquo; เพื่อเริ่ม
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition shadow-soft"
            >
              <Plus size={12} />
              บันทึกรายรับ
            </button>
          </div>
        ) : (
          <div className="divide-y divide-orange-100">
            {filtered.map((i) => {
              const clientName = i.client_id
                ? clientMap.get(i.client_id)
                : null;
              const cat = INCOME_CATEGORIES[i.category];
              return (
                <div
                  key={i.id}
                  className="px-4 sm:px-5 py-3 hover:bg-orange-50/30 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <TrendingUp size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-ink-900 truncate">
                          {i.description}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${cat?.color}`}
                        >
                          {cat?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-400 mt-0.5 flex-wrap">
                        <span>{fmtDateDisplay(i.received_at)}</span>
                        {clientName && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <User size={9} />
                              {clientName}
                            </span>
                          </>
                        )}
                        {Number(i.wht_amount) > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-rose-600">
                              WHT ฿{fmtMoney(Number(i.wht_amount))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-green-600 tabular-nums">
                        ฿{fmtMoney(Number(i.amount))}
                      </div>
                      <div className="text-xs text-ink-400 tabular-nums">
                        สุทธิ ฿{fmtMoney(Number(i.amount) - Number(i.wht_amount))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button
                        onClick={() => setEditing(i)}
                        className="p-1.5 rounded-full hover:bg-orange-50 text-ink-400 hover:text-brand-600"
                        aria-label="แก้ไข"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(i.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-ink-400 hover:text-red-600"
                        aria-label="ลบ"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <IncomeFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={onCreate}
      />
      <IncomeFormModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={onUpdate}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive";
}) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-3 py-2.5">
      <div className="text-xs text-ink-400 uppercase tracking-wide truncate">
        {label}
      </div>
      <div
        className={`text-base font-bold mt-0.5 tabular-nums ${
          tone === "positive" ? "text-green-600" : "text-ink-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
