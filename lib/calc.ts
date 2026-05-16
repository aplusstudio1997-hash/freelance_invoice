import { QuoteSettings } from "./types";

export interface AdjustedService {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  adjustedUnitPrice: number;
  quantity: number;
  free: boolean;
  total: number;
}

export interface CalcResult {
  servicesSubtotal: number;
  difficultyFee: number;
  difficultyBreakdown: { label: string; amount: number }[];
  totalDifficultyPercent: number;
  adjustedServices: AdjustedService[];
  extrasFee: number;
  extrasBreakdown: { label: string; amount: number }[];
  hiddenCostNum: number;
  preDiscount: number;
  discountValue: number;
  afterDiscount: number;
  vatAmount: number;
  beforeWithholding: number;
  taxDeduction: number;
  subtotal: number;
  total: number;
  deposit: number;
  workingDays: number;
  totalHours: number;
  hourlyRate: number;
}

// Parses "YYYY-MM-DD" as a LOCAL date (not UTC, which is what `new Date(str)` does).
// Avoids off-by-one bugs for users east/west of UTC.
function parseLocalDate(iso: string): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

// Formats a Date back to "YYYY-MM-DD" using LOCAL date parts.
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function workingDaysBetween(start: string, end: string): number {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  if (!s || !e || e < s) return 0;
  let count = 0;
  // iterate by UTC day-count to avoid DST 23h/25h jumps producing wrong counts
  // or infinite loops in DST locales
  const startUtc = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const endUtc = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  const days = Math.round((endUtc - startUtc) / 86400000);
  for (let i = 0; i <= days; i++) {
    const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate() + i);
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

export function calculate(q: QuoteSettings): CalcResult {
  const totalDifficultyPercent = (q.difficulties || []).reduce(
    (acc, x) => (x.enabled && x.percent > 0 ? acc + x.percent : acc),
    0
  );
  const difficultyMultiplier = 1 + totalDifficultyPercent / 100;

  const adjustedServices: AdjustedService[] = q.services.map((s) => {
    const unitPrice = Number(s.price) || 0;
    const qty = Math.max(1, Number(s.quantity) || 1);
    let adjustedUnitPrice = unitPrice;
    if (!s.free && totalDifficultyPercent > 0 && unitPrice > 0) {
      const raised = unitPrice * difficultyMultiplier;
      // Round up to nearest 10 for nicer-looking numbers, but ONLY when the raw
      // price is already >= 10. For cheap items (e.g. ฿5) rounding to ฿10 would
      // double the price, which is much worse than the small-difficulty adjustment.
      adjustedUnitPrice =
        raised >= 10 ? Math.ceil(raised / 10) * 10 : Math.round(raised * 100) / 100;
    }
    return {
      id: s.id,
      name: s.name,
      description: s.description || "",
      unitPrice,
      adjustedUnitPrice,
      quantity: qty,
      free: s.free,
      total: s.free ? 0 : adjustedUnitPrice * qty,
    };
  });

  const servicesSubtotal = adjustedServices.reduce(
    (acc, s) => acc + s.total,
    0
  );

  const difficultyFee = 0;
  const difficultyBreakdown: { label: string; amount: number }[] = [];

  let extrasFee = 0;
  const extrasBreakdown: { label: string; amount: number }[] = [];
  (q.extras || []).forEach((x) => {
    if (x.enabled && x.percent > 0) {
      const amount = servicesSubtotal * (x.percent / 100);
      extrasFee += amount;
      extrasBreakdown.push({ label: `${x.label} (+${x.percent}%)`, amount });
    }
  });

  const hiddenCostNum = Number(q.hiddenCost) || 0;

  const preDiscount = servicesSubtotal + extrasFee + hiddenCostNum;

  const discountValue =
    q.discountUnit === "baht"
      ? Number(q.discount) || 0
      : preDiscount * ((Number(q.discount) || 0) / 100);

  const afterDiscount = Math.max(0, preDiscount - discountValue);

  const vatAmount = q.vat7 ? afterDiscount * 0.07 : 0;
  const beforeWithholding = afterDiscount + vatAmount;

  const taxDeduction = q.tax3Percent ? afterDiscount * 0.03 : 0;
  const total = Math.max(0, beforeWithholding - taxDeduction);
  const subtotal = afterDiscount;

  const termMap: Record<string, number> = {
    "30": 0.3,
    "50": 0.5,
    "70": 0.7,
    full: 1,
  };
  const deposit = total * (termMap[q.paymentTerm] ?? 0.5);

  const workingDays = workingDaysBetween(q.startDate, q.endDate);
  const totalHours = workingDays * 8;
  const hourlyRate = totalHours > 0 ? total / totalHours : 0;

  return {
    servicesSubtotal,
    difficultyFee,
    difficultyBreakdown,
    totalDifficultyPercent,
    adjustedServices,
    extrasFee,
    extrasBreakdown,
    hiddenCostNum,
    preDiscount,
    discountValue,
    afterDiscount,
    vatAmount,
    beforeWithholding,
    taxDeduction,
    subtotal,
    total,
    deposit,
    workingDays,
    totalHours,
    hourlyRate,
  };
}

export function fmt(n: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export function buildMilestones(
  startDate: string,
  endDate: string,
  existing: { id: string; label: string; date: string; type: string }[]
): {
  id: string;
  label: string;
  date: string;
  type: "deposit" | "draft" | "final";
}[] {
  const findExisting = (id: string) => existing.find((m) => m.id === id);

  const getAutoDate = (idx: number, total: number): string => {
    const s = parseLocalDate(startDate);
    const e = parseLocalDate(endDate);
    if (!s || !e || e < s) return "";
    if (total <= 1) return startDate;
    const ratio = idx / (total - 1);
    const t = s.getTime() + (e.getTime() - s.getTime()) * ratio;
    return formatLocalDate(new Date(t));
  };

  const total = 3;

  const deposit = findExisting("deposit");
  const draft = findExisting("draft");
  const final = findExisting("final");

  return [
    {
      id: "deposit",
      label: "มัดจำ / เริ่มงาน",
      date: startDate || deposit?.date || getAutoDate(0, total),
      type: "deposit",
    },
    {
      id: "draft",
      label: "ส่งร่างเบื้องต้น",
      date: draft?.date || getAutoDate(1, total),
      type: "draft",
    },
    {
      id: "final",
      label: "ส่งมอบสุดท้าย",
      date: endDate || final?.date || getAutoDate(total - 1, total),
      type: "final",
    },
  ];
}
