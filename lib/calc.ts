import { QuoteSettings } from "./types";

export interface CalcResult {
  servicesSubtotal: number;
  difficultyFee: number;
  extrasFee: number;
  extrasBreakdown: { label: string; amount: number }[];
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
  const servicesSubtotal = q.services.reduce((acc, s) => {
    if (s.free) return acc;
    const qty = Math.max(1, Number(s.quantity) || 1);
    return acc + (Number(s.price) || 0) * qty;
  }, 0);

  let difficultyFee = 0;
  if (q.difficultCommunication) difficultyFee += servicesSubtotal * 0.15;
  if (q.frequentChanges) difficultyFee += servicesSubtotal * 0.1;

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
    extrasBreakdown,
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

export function fmtDateShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

export function buildMilestones(
  startDate: string,
  endDate: string,
  revisions: number,
  existing: { id: string; label: string; date: string; type: string }[]
): { id: string; label: string; date: string; type: "deposit" | "draft" | "revision" | "final" }[] {
  const findExisting = (id: string) => existing.find((m) => m.id === id);
  const revCount = Math.max(0, revisions);
  const totalPoints = 2 + 1 + revCount;

  const getAutoDate = (idx: number): string => {
    if (!startDate || !endDate) return "";
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return "";
    if (totalPoints <= 1) return startDate;
    const ratio = idx / (totalPoints - 1);
    const t = s.getTime() + (e.getTime() - s.getTime()) * ratio;
    return new Date(t).toISOString().slice(0, 10);
  };

  const list: { id: string; label: string; date: string; type: "deposit" | "draft" | "revision" | "final" }[] = [];

  const deposit = findExisting("deposit");
  list.push({
    id: "deposit",
    label: "มัดจำ / เริ่มงาน",
    date: deposit?.date || startDate || getAutoDate(0),
    type: "deposit",
  });

  const draft = findExisting("draft");
  list.push({
    id: "draft",
    label: "ส่งร่างเบื้องต้น",
    date: draft?.date || getAutoDate(1),
    type: "draft",
  });

  for (let i = 1; i <= revCount; i++) {
    const id = `revision_${i}`;
    const found = findExisting(id);
    list.push({
      id,
      label: `แก้ไขรอบที่ ${i}`,
      date: found?.date || getAutoDate(1 + i),
      type: "revision",
    });
  }

  const final = findExisting("final");
  list.push({
    id: "final",
    label: "ส่งมอบสุดท้าย",
    date: final?.date || endDate || getAutoDate(totalPoints - 1),
    type: "final",
  });

  return list;
}
