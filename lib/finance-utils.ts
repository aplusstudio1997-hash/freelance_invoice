import { IncomeCategory, ExpenseCategory } from "./finance";

export const INCOME_CATEGORIES: Record<
  IncomeCategory,
  { label: string; color: string }
> = {
  service: { label: "ค่าบริการ", color: "bg-orange-50 text-brand-700 border-brand-100" },
  product: { label: "ขายสินค้า", color: "bg-blue-50 text-blue-700 border-blue-100" },
  royalty: { label: "ค่าลิขสิทธิ์", color: "bg-purple-50 text-purple-700 border-purple-100" },
  consulting: { label: "ที่ปรึกษา", color: "bg-green-50 text-green-700 border-green-100" },
  other: { label: "อื่น ๆ", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  { label: string; color: string }
> = {
  software: { label: "ซอฟต์แวร์", color: "bg-blue-50 text-blue-700 border-blue-100" },
  hardware: { label: "อุปกรณ์", color: "bg-purple-50 text-purple-700 border-purple-100" },
  office: { label: "ของใช้ออฟฟิศ", color: "bg-amber-50 text-amber-700 border-amber-100" },
  travel: { label: "เดินทาง", color: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  meal: { label: "ค่าอาหาร", color: "bg-pink-50 text-pink-700 border-pink-100" },
  marketing: { label: "การตลาด", color: "bg-orange-50 text-brand-700 border-brand-100" },
  education: { label: "เรียน/สัมมนา", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  tax: { label: "ภาษี/ค่าธรรมเนียม", color: "bg-rose-50 text-rose-700 border-rose-100" },
  subscription: { label: "Subscription", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  other: { label: "อื่น ๆ", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtDateInput(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function fmtDateDisplay(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getMonthRange(
  year: number,
  month: number
): { from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export function getYearRange(year: number): { from: string; to: string } {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const bom = "\uFEFF";
  const csv = rows
    .map((r) =>
      r
        .map((v) => {
          const s = String(v ?? "");
          if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return '"' + s.replace(/"/g, '""') + '"';
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
