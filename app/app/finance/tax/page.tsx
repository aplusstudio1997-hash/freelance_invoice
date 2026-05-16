"use client";

import { useEffect, useState, useMemo } from "react";
import {
  listIncomes,
  listExpenses,
  IncomeRecord,
  ExpenseRecord,
  TaxInputs,
  DEFAULT_TAX_INPUTS,
  calculateThaiTax,
  TaxResult,
  computeStandardExpenseDeduction,
} from "@/lib/finance";
import {
  fmtMoney,
  THAI_MONTHS_SHORT,
  downloadCsv,
} from "@/lib/finance-utils";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  Info,
  Loader2,
} from "lucide-react";

// Parse "YYYY-MM-DD" using local components so the month bucket isn't shifted
// by UTC conversion for users east/west of UTC.
function monthOfIso(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return Number(m[2]) - 1;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? 0 : d.getMonth();
}

export default function TaxPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_TAX_INPUTS);
  // remember which auto-populated fields the user manually overrode so we
  // don't clobber their typed-in values on a year reload
  const [touched, setTouched] = useState<{
    actualExpense?: boolean;
    whtPaid?: boolean;
    income?: boolean;
  }>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [i, e] = await Promise.all([
          listIncomes(`${year}-01-01`, `${year}-12-31`),
          listExpenses(`${year}-01-01`, `${year}-12-31`),
        ]);
        if (cancelled) return;
        setIncomes(i);
        setExpenses(e);

        const totalIncome = i.reduce(
          (acc, x) => acc + Number(x.amount ?? 0),
          0
        );
        const totalWHT = i.reduce(
          (acc, x) => acc + Number(x.wht_amount ?? 0),
          0
        );
        const totalExpense = e.reduce(
          (acc, x) => acc + Number(x.amount ?? 0),
          0
        );
        setInputs((prev) => ({
          ...prev,
          income: touched.income ? prev.income : totalIncome,
          actualExpense: touched.actualExpense
            ? prev.actualExpense
            : totalExpense,
          whtPaid: touched.whtPaid ? prev.whtPaid : totalWHT,
        }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // we intentionally exclude `touched` from deps — it should affect only the
    // next year-load, not retrigger fetches when the user types
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const monthlySum = useMemo(() => {
    const rows = Array.from({ length: 12 }, (_, idx) => ({
      month: idx + 1,
      income: 0,
      expense: 0,
      wht: 0,
    }));
    incomes.forEach((i) => {
      const m = monthOfIso(i.received_at);
      rows[m].income += Number(i.amount ?? 0);
      rows[m].wht += Number(i.wht_amount ?? 0);
    });
    expenses.forEach((e) => {
      const m = monthOfIso(e.paid_at);
      rows[m].expense += Number(e.amount ?? 0);
    });
    return rows;
  }, [incomes, expenses]);

  const result: TaxResult = useMemo(
    () => calculateThaiTax(inputs),
    [inputs]
  );

  const standard = computeStandardExpenseDeduction(inputs.income);

  const set = (patch: Partial<TaxInputs>) => {
    // any manual edit to an auto-populated field marks it as user-touched so
    // the next year-reload doesn't overwrite it
    setTouched((t) => ({
      ...t,
      ...(patch.income !== undefined ? { income: true } : {}),
      ...(patch.actualExpense !== undefined ? { actualExpense: true } : {}),
      ...(patch.whtPaid !== undefined ? { whtPaid: true } : {}),
    }));
    setInputs((p) => ({ ...p, ...patch }));
  };

  const exportFull = () => {
    const rows: string[][] = [
      [`สรุปรายได้-รายจ่าย ปี ${year + 543}`, "", "", ""],
      ["เดือน", "รายรับ", "รายจ่าย", "WHT 3%"],
      ...monthlySum.map((r) => [
        THAI_MONTHS_SHORT[r.month - 1],
        String(r.income),
        String(r.expense),
        String(r.wht),
      ]),
      [
        "รวม",
        String(monthlySum.reduce((a, r) => a + r.income, 0)),
        String(monthlySum.reduce((a, r) => a + r.expense, 0)),
        String(monthlySum.reduce((a, r) => a + r.wht, 0)),
      ],
      ["", "", "", ""],
      ["สรุปภาษีโดยประมาณ", "", "", ""],
      ["รายได้รวม", String(inputs.income), "", ""],
      ["หักค่าใช้จ่าย", String(result.expenseDeduction), "", ""],
      ["ค่าลดหย่อนรวม", String(result.totalDeduction), "", ""],
      ["เงินได้สุทธิ", String(result.taxableIncome), "", ""],
      ["ภาษีตามขั้น", String(result.taxTotal), "", ""],
      ["WHT ที่หักไว้", String(result.whtPaid), "", ""],
      ["ภาษีต้องจ่ายเพิ่ม", String(result.taxOwed), "", ""],
    ];
    downloadCsv(`tax-summary-${year}.csv`, rows);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-500 flex items-center justify-center">
              <Calculator size={16} />
            </div>
            <div>
              <div className="font-semibold text-ink-900">
                สรุปภาษีรายปี
              </div>
              <div className="text-xs text-ink-400">
                ประมาณการ ภงด.90 / ภงด.91 — ใช้เพื่อวางแผนเบื้องต้นเท่านั้น
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-orange-50/40 border border-orange-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white"
            >
              {[year - 2, year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  ปีภาษี {y + 543}
                </option>
              ))}
            </select>
            <button
              onClick={exportFull}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-xs font-medium transition shadow-soft"
            >
              <Download size={12} />
              CSV
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="bg-white/85 border border-orange-100 rounded-3xl shadow-soft py-12 text-center text-ink-400 text-sm">
          <Loader2 size={14} className="animate-spin inline mr-2" />
          กำลังโหลด...
        </div>
      ) : (
        <>
          <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
            <h3 className="font-semibold text-ink-900 mb-4">
              สรุปรายเดือน ปี {year + 543}
            </h3>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-400 uppercase">
                    <th className="py-2 pr-3 font-medium">เดือน</th>
                    <th className="py-2 px-3 font-medium text-right">รายรับ</th>
                    <th className="py-2 px-3 font-medium text-right">รายจ่าย</th>
                    <th className="py-2 px-3 font-medium text-right">WHT</th>
                    <th className="py-2 pl-3 font-medium text-right">กำไร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {monthlySum.map((r) => {
                    const profit = r.income - r.expense;
                    return (
                      <tr key={r.month}>
                        <td className="py-2 pr-3 text-ink-700">
                          {THAI_MONTHS_SHORT[r.month - 1]}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-green-600">
                          ฿{fmtMoney(r.income)}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-rose-600">
                          ฿{fmtMoney(r.expense)}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-ink-500">
                          ฿{fmtMoney(r.wht)}
                        </td>
                        <td
                          className={`py-2 pl-3 text-right tabular-nums font-medium ${
                            profit >= 0 ? "text-ink-900" : "text-rose-600"
                          }`}
                        >
                          ฿{fmtMoney(profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-orange-50/40 font-bold">
                    <td className="py-2 pr-3 text-ink-900">รวม</td>
                    <td className="py-2 px-3 text-right tabular-nums text-green-700">
                      ฿{fmtMoney(monthlySum.reduce((a, r) => a + r.income, 0))}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-rose-700">
                      ฿{fmtMoney(monthlySum.reduce((a, r) => a + r.expense, 0))}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-ink-700">
                      ฿{fmtMoney(monthlySum.reduce((a, r) => a + r.wht, 0))}
                    </td>
                    <td className="py-2 pl-3 text-right tabular-nums text-ink-900">
                      ฿{fmtMoney(monthlySum.reduce((a, r) => a + r.income - r.expense, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
            <section className="lg:col-span-2 bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
              <h3 className="font-semibold text-ink-900 mb-3">
                คำนวณภาษีโดยประมาณ
              </h3>

              <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-3 text-xs text-ink-600 flex items-start gap-2 mb-4">
                <Info size={12} className="text-brand-500 mt-0.5 shrink-0" />
                <div>
                  ระบบคำนวณตามอัตราภาษีปี 2567 — ตัวเลขเป็นการประมาณการเบื้องต้น
                  กรุณาตรวจสอบกับนักบัญชี/กรมสรรพากรอีกครั้งก่อนยื่นจริง
                </div>
              </div>

              <div className="space-y-3.5">
                <NumberField
                  label="รายได้รวม (เงินได้พึงประเมิน)"
                  value={inputs.income}
                  onChange={(v) => set({ income: v })}
                />

                <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-ink-700">
                      การหักค่าใช้จ่าย
                    </div>
                    <div className="flex items-center gap-1 bg-white rounded-full p-0.5 border border-orange-100">
                      <RadioPill
                        active={!inputs.useActualExpense}
                        onClick={() => set({ useActualExpense: false })}
                        label="หักเหมา 60%"
                      />
                      <RadioPill
                        active={inputs.useActualExpense}
                        onClick={() => set({ useActualExpense: true })}
                        label="หักจริง"
                      />
                    </div>
                  </div>
                  {!inputs.useActualExpense ? (
                    <div className="text-xs text-ink-600">
                      หักได้: <span className="font-bold text-ink-900 tabular-nums">฿{fmtMoney(standard)}</span>
                      <span className="text-ink-400 ml-2">(60% ของรายได้ สูงสุด ฿600,000)</span>
                    </div>
                  ) : (
                    <NumberField
                      label="รายจ่ายตามจริง"
                      value={inputs.actualExpense}
                      onChange={(v) => set({ actualExpense: v })}
                      compact
                    />
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <NumberField
                    label="ลดหย่อนส่วนตัว"
                    value={inputs.personalDeduction}
                    onChange={(v) => set({ personalDeduction: v })}
                    hint="ปกติ ฿60,000"
                  />
                  <NumberField
                    label="ลดหย่อนคู่สมรส"
                    value={inputs.spouseDeduction}
                    onChange={(v) => set({ spouseDeduction: v })}
                    hint="ถ้ามี ฿60,000"
                  />
                  <NumberField
                    label="ลดหย่อนบุตร"
                    value={inputs.childDeduction}
                    onChange={(v) => set({ childDeduction: v })}
                  />
                  <NumberField
                    label="ลดหย่อนพ่อแม่"
                    value={inputs.parentDeduction}
                    onChange={(v) => set({ parentDeduction: v })}
                  />
                  <NumberField
                    label="ประกันสังคม"
                    value={inputs.socialSecurity}
                    onChange={(v) => set({ socialSecurity: v })}
                  />
                  <NumberField
                    label="เบี้ยประกันชีวิต/สุขภาพ"
                    value={inputs.insurancePremium}
                    onChange={(v) => set({ insurancePremium: v })}
                  />
                  <NumberField
                    label="RMF"
                    value={inputs.rmf}
                    onChange={(v) => set({ rmf: v })}
                  />
                  <NumberField
                    label="SSF / ThaiESG"
                    value={inputs.ssf}
                    onChange={(v) => set({ ssf: v })}
                  />
                  <NumberField
                    label="เงินบริจาค"
                    value={inputs.donation}
                    onChange={(v) => set({ donation: v })}
                  />
                  <NumberField
                    label="ลดหย่อนอื่น ๆ"
                    value={inputs.otherDeduction}
                    onChange={(v) => set({ otherDeduction: v })}
                  />
                </div>

                <NumberField
                  label="WHT ที่ถูกหักไปแล้ว"
                  value={inputs.whtPaid}
                  onChange={(v) => set({ whtPaid: v })}
                  hint="ระบบเติมให้อัตโนมัติจากรายรับที่บันทึก"
                />
              </div>
            </section>

            <section className="bg-gradient-to-br from-ink-900 to-ink-800 text-white rounded-3xl shadow-soft-lg p-5 sm:p-6 h-fit">
              <h3 className="font-semibold mb-4 text-white/90">
                สรุปภาษีโดยประมาณ
              </h3>

              <ResultRow label="รายได้รวม" value={`฿${fmtMoney(inputs.income)}`} />
              <ResultRow
                label="หักค่าใช้จ่าย"
                value={`฿${fmtMoney(result.expenseDeduction)}`}
                muted
              />
              <ResultRow
                label="ค่าลดหย่อนรวม"
                value={`฿${fmtMoney(result.totalDeduction)}`}
                muted
              />
              <div className="border-t border-white/15 my-2.5" />
              <ResultRow
                label="เงินได้สุทธิ"
                value={`฿${fmtMoney(result.taxableIncome)}`}
              />
              <ResultRow
                label="ภาษีตามขั้น"
                value={`฿${fmtMoney(result.taxTotal)}`}
                muted
              />
              <ResultRow
                label="WHT ที่หักไว้"
                value={`-฿${fmtMoney(result.whtPaid)}`}
                muted
              />
              <div className="border-t border-white/15 my-2.5" />
              <div className="bg-white/10 rounded-2xl p-3 mt-2">
                <div className="text-xs text-white/70 uppercase tracking-wide">
                  ภาษีต้องจ่ายเพิ่ม
                </div>
                <div className="text-2xl font-bold mt-0.5 tabular-nums">
                  ฿{fmtMoney(result.taxOwed)}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  อัตราภาษีที่แท้จริง {(result.effectiveRate * 100).toFixed(2)}%
                </div>
              </div>

              {result.taxByBracket.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-white/70 uppercase tracking-wide mb-2">
                    คำนวณตามขั้น
                  </div>
                  <div className="space-y-1">
                    {result.taxByBracket.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-white/70"
                      >
                        <span>{(b.bracket.rate * 100).toFixed(0)}% ของ ฿{fmtMoney(b.taxable)}</span>
                        <span className="tabular-nums">฿{fmtMoney(b.tax)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <SmallCard
              icon={<TrendingUp size={14} />}
              label={`รายรับปี ${year + 543}`}
              value={`฿${fmtMoney(inputs.income)}`}
              tone="positive"
            />
            <SmallCard
              icon={<TrendingDown size={14} />}
              label={`รายจ่ายปี ${year + 543}`}
              value={`฿${fmtMoney(monthlySum.reduce((a, r) => a + r.expense, 0))}`}
              tone="negative"
            />
            <SmallCard
              icon={<Wallet size={14} />}
              label="กำไรหลังภาษี"
              value={`฿${fmtMoney(result.netAfterTax)}`}
            />
          </div>
        </>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
  compact,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  compact?: boolean;
}) {
  const [str, setStr] = useState(value ? String(value) : "");
  useEffect(() => {
    setStr(value ? String(value) : "");
  }, [value]);
  return (
    <div>
      <label
        className={`block text-xs font-medium text-ink-700 ${
          compact ? "mb-1" : "mb-1.5"
        }`}
      >
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="100"
        value={str}
        onChange={(e) => {
          setStr(e.target.value);
          const n = parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className="w-full px-3.5 py-2 bg-orange-50/40 border border-orange-100 rounded-xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition tabular-nums"
      />
      {hint && <div className="text-xs text-ink-400 mt-1">{hint}</div>}
    </div>
  );
}

function RadioPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
        active
          ? "bg-ink-900 text-white"
          : "text-ink-500 hover:text-ink-900"
      }`}
    >
      {label}
    </button>
  );
}

function ResultRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={muted ? "text-white/60" : "text-white/85"}>{label}</span>
      <span
        className={`tabular-nums font-medium ${
          muted ? "text-white/70" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SmallCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="bg-white/85 border border-orange-100 rounded-2xl shadow-soft px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-400 uppercase tracking-wide truncate">
          {label}
        </span>
        <span
          className={`shrink-0 ${
            tone === "positive"
              ? "text-green-600"
              : tone === "negative"
                ? "text-rose-600"
                : "text-ink-400"
          }`}
        >
          {icon}
        </span>
      </div>
      <div
        className={`text-lg font-bold tabular-nums mt-0.5 ${
          tone === "positive"
            ? "text-green-600"
            : tone === "negative"
              ? "text-rose-600"
              : "text-ink-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
