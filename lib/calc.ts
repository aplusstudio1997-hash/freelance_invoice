import { QuoteSettings } from "./types";

export interface CalcResult {
  servicesSubtotal: number;
  difficultyFee: number;
  extrasFee: number;
  revisionFeeTotal: number;
  hiddenCostNum: number;
  discountValue: number;
  taxDeduction: number;
  subtotal: number;
  total: number;
  deposit: number;
  workingDays: number;
  totalHours: number;
  hourlyRate: number;
}

function workingDaysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function calculate(q: QuoteSettings): CalcResult {
  const servicesSubtotal = q.services.reduce(
    (acc, s) => acc + (s.free ? 0 : Number(s.price) || 0),
    0
  );

  let difficultyFee = 0;
  if (q.difficultCommunication) difficultyFee += servicesSubtotal * 0.15;
  if (q.frequentChanges) difficultyFee += servicesSubtotal * 0.1;

  let extrasFee = 0;
  if (q.extras.sourceFile) extrasFee += servicesSubtotal * 0.2;
  if (q.extras.commercialRights) extrasFee += servicesSubtotal * 0.3;
  if (q.extras.urgent) extrasFee += servicesSubtotal * 0.25;

  const hiddenCostNum = Number(q.hiddenCost) || 0;

  const beforeRevision =
    servicesSubtotal + difficultyFee + extrasFee + hiddenCostNum;

  const extraRevisions = Math.max(0, q.revisions - 3);
  const revisionFeeTotal =
    q.revisionFeeUnit === "baht"
      ? extraRevisions * (Number(q.revisionFee) || 0)
      : extraRevisions * beforeRevision * ((Number(q.revisionFee) || 0) / 100);

  const preDiscount = beforeRevision + revisionFeeTotal;

  const discountValue =
    q.discountUnit === "baht"
      ? Number(q.discount) || 0
      : preDiscount * ((Number(q.discount) || 0) / 100);

  const subtotal = Math.max(0, preDiscount - discountValue);
  const taxDeduction = q.tax3Percent ? subtotal * 0.03 : 0;
  const total = Math.max(0, subtotal - taxDeduction);

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
    extrasFee,
    revisionFeeTotal,
    hiddenCostNum,
    discountValue,
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
