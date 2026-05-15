"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ExpenseRecord,
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/finance";
import {
  EXPENSE_CATEGORIES,
  THAI_MONTHS,
  fmtMoney,
  fmtDateDisplay,
  downloadCsv,
} from "@/lib/finance-utils";
import ExpenseFormModal from "@/components/finance/ExpenseFormModal";
import {
  TrendingDown,
  Plus,
  Pencil,
  Trash2,
  Download,
  Store,
  Loader2,
} from "lucide-react";

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await listExpenses(`${year}-01-01`, `${year}-12-31`);
      setExpenses(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.paid_at);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [expenses, year, month]);

  const monthStats = useMemo(() => {
    const total = filtered.reduce((a, e) => a + Number(e.amount), 0);
    const vat = filtered.reduce((a, e) => a + Number(e.vat_amount), 0);
    return { total, vat };
  }, [filtered]);

  const yearStats = useMemo(() => {
    return expenses.reduce((a, e) => a + Number(e.amount), 0);
  }, [expenses]);

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    filtered.forEach((e) => {
      m.set(e.category, (m.get(e.category) || 0) + Number(e.amount));
    });
    return Array.from(m.entries())
      .map(([cat, total]) => ({ cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const onCreate = async (data: Parameters<typeof createExpense>[0]) => {
    await createExpense(data);
    await refresh();
  };

  const onUpdate = async (data: Parameters<typeof createExpense>[0]) => {
    if (!editing) return;
    await updateExpense(editing.id, data);
    setEditing(null);
    await refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("ลบรายจ่ายนี้?")) return;
    await deleteExpense(id);
    await refresh();
  };

  const exportCsv = () => {
    const rows: string[][] = [
      ["วันที่", "รายละเอียด", "หมวด", "ร้านค้า", "จำนวน", "VAT"],
      ...filtered.map((e) => [
        e.paid_at,
        e.description,
        EXPENSE_CATEGORIES[e.category]?.label || e.category,
        e.vendor,
        String(e.amount),
        String(e.vat_amount),
      ]),
      ["", "", "", "รวม", String(monthStats.total), String(monthStats.vat)],
    ];
    downloadCsv(`expense-${year}-${String(month).padStart(2, "0")}.csv`, rows);
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
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition shadow-soft"
            >
              <Plus size={12} />
              บันทึกรายจ่าย
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <Stat label="จ่ายเดือนนี้" value={`฿${fmtMoney(monthStats.total)}`} tone="negative" />
          <Stat label="VAT ที่จ่าย" value={`฿${fmtMoney(monthStats.vat)}`} />
          <Stat label="หมวดเยอะสุด" value={byCategory[0] ? EXPENSE_CATEGORIES[byCategory[0].cat as keyof typeof EXPENSE_CATEGORIES]?.label || "—" : "—"} />
          <Stat
            label={`จ่ายรวมปี ${year + 543}`}
            value={`฿${fmtMoney(yearStats)}`}
          />
        </div>

        {byCategory.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {byCategory.slice(0, 6).map((b) => {
              const cat = EXPENSE_CATEGORIES[b.cat as keyof typeof EXPENSE_CATEGORIES];
              const pct = monthStats.total > 0 ? Math.round((b.total / monthStats.total) * 100) : 0;
              return (
                <span
                  key={b.cat}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cat?.color}`}
                >
                  {cat?.label} {pct}%
                </span>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">
            <Loader2 size={14} className="animate-spin mr-2" />
            กำลังโหลด...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <TrendingDown size={22} />
            </div>
            <div className="text-sm font-medium text-ink-700">
              ยังไม่มีรายจ่ายใน{THAI_MONTHS[month - 1]} {year + 543}
            </div>
            <div className="text-xs text-ink-400 mt-1">
              กดปุ่ม &ldquo;บันทึกรายจ่าย&rdquo; เพื่อเริ่ม
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition shadow-soft"
            >
              <Plus size={12} />
              บันทึกรายจ่าย
            </button>
          </div>
        ) : (
          <div className="divide-y divide-orange-100">
            {filtered.map((e) => {
              const cat = EXPENSE_CATEGORIES[e.category];
              return (
                <div
                  key={e.id}
                  className="px-4 sm:px-5 py-3 hover:bg-orange-50/30 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <TrendingDown size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-ink-900 truncate">
                          {e.description}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${cat?.color}`}
                        >
                          {cat?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-400 mt-0.5 flex-wrap">
                        <span>{fmtDateDisplay(e.paid_at)}</span>
                        {e.vendor && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Store size={9} />
                              {e.vendor}
                            </span>
                          </>
                        )}
                        {Number(e.vat_amount) > 0 && (
                          <>
                            <span>·</span>
                            <span>VAT ฿{fmtMoney(Number(e.vat_amount))}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-rose-600 tabular-nums">
                        ฿{fmtMoney(Number(e.amount))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button
                        onClick={() => setEditing(e)}
                        className="p-1.5 rounded-full hover:bg-orange-50 text-ink-400 hover:text-brand-600"
                        aria-label="แก้ไข"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(e.id)}
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

      <ExpenseFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={onCreate}
      />
      <ExpenseFormModal
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
  tone?: "negative";
}) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-3 py-2.5">
      <div className="text-xs text-ink-400 uppercase tracking-wide truncate">
        {label}
      </div>
      <div
        className={`text-base font-bold mt-0.5 tabular-nums truncate ${
          tone === "negative" ? "text-rose-600" : "text-ink-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
