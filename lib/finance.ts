import { getSupabase } from "./supabase";

export type IncomeCategory =
  | "service"
  | "product"
  | "royalty"
  | "consulting"
  | "other";

export type ExpenseCategory =
  | "software"
  | "hardware"
  | "office"
  | "travel"
  | "meal"
  | "marketing"
  | "education"
  | "tax"
  | "subscription"
  | "other";

export interface IncomeRecord {
  id: string;
  user_id: string;
  client_id: string | null;
  document_id: string | null;
  category: IncomeCategory;
  description: string;
  amount: number;
  currency: string;
  wht_amount: number;
  vat_amount: number;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRecord {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  vat_amount: number;
  vendor: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueGoalRecord {
  id: string;
  user_id: string;
  year: number;
  month: number;
  amount: number;
  currency: string;
}

export interface IncomeInput {
  clientId?: string | null;
  documentId?: string | null;
  category: IncomeCategory;
  description: string;
  amount: number;
  currency?: string;
  whtAmount?: number;
  vatAmount?: number;
  receivedAt: string;
}

export interface ExpenseInput {
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency?: string;
  vatAmount?: number;
  vendor?: string;
  paidAt: string;
}

// ========================================================================
// INCOMES
// ========================================================================

export async function listIncomes(
  fromIso?: string,
  toIso?: string
): Promise<IncomeRecord[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  let q = sb
    .from("incomes")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("received_at", { ascending: false });
  if (fromIso) q = q.gte("received_at", fromIso);
  if (toIso) q = q.lte("received_at", toIso);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as IncomeRecord[];
}

export async function createIncome(input: IncomeInput): Promise<IncomeRecord> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { data, error } = await sb
    .from("incomes")
    .insert({
      user_id: auth.user.id,
      client_id: input.clientId || null,
      document_id: input.documentId || null,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency || "THB",
      wht_amount: input.whtAmount || 0,
      vat_amount: input.vatAmount || 0,
      received_at: input.receivedAt,
    })
    .select()
    .single();
  if (error) throw error;
  return data as IncomeRecord;
}

export async function updateIncome(
  id: string,
  patch: Partial<IncomeInput>
): Promise<void> {
  const sb = getSupabase();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.clientId !== undefined) update.client_id = patch.clientId;
  if (patch.documentId !== undefined) update.document_id = patch.documentId;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.amount !== undefined) update.amount = patch.amount;
  if (patch.currency !== undefined) update.currency = patch.currency;
  if (patch.whtAmount !== undefined) update.wht_amount = patch.whtAmount;
  if (patch.vatAmount !== undefined) update.vat_amount = patch.vatAmount;
  if (patch.receivedAt !== undefined) update.received_at = patch.receivedAt;
  const { error } = await sb.from("incomes").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteIncome(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("incomes").delete().eq("id", id);
  if (error) throw error;
}

// ========================================================================
// EXPENSES
// ========================================================================

export async function listExpenses(
  fromIso?: string,
  toIso?: string
): Promise<ExpenseRecord[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  let q = sb
    .from("expenses")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("paid_at", { ascending: false });
  if (fromIso) q = q.gte("paid_at", fromIso);
  if (toIso) q = q.lte("paid_at", toIso);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as ExpenseRecord[];
}

export async function createExpense(
  input: ExpenseInput
): Promise<ExpenseRecord> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { data, error } = await sb
    .from("expenses")
    .insert({
      user_id: auth.user.id,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency || "THB",
      vat_amount: input.vatAmount || 0,
      vendor: input.vendor || "",
      paid_at: input.paidAt,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ExpenseRecord;
}

export async function updateExpense(
  id: string,
  patch: Partial<ExpenseInput>
): Promise<void> {
  const sb = getSupabase();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.amount !== undefined) update.amount = patch.amount;
  if (patch.currency !== undefined) update.currency = patch.currency;
  if (patch.vatAmount !== undefined) update.vat_amount = patch.vatAmount;
  if (patch.vendor !== undefined) update.vendor = patch.vendor;
  if (patch.paidAt !== undefined) update.paid_at = patch.paidAt;
  const { error } = await sb.from("expenses").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteExpense(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// ========================================================================
// REVENUE GOALS
// ========================================================================

export async function getGoal(
  year: number,
  month: number
): Promise<RevenueGoalRecord | null> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await sb
    .from("revenue_goals")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();
  if (error) return null;
  return (data as RevenueGoalRecord) || null;
}

export async function listGoals(year: number): Promise<RevenueGoalRecord[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await sb
    .from("revenue_goals")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("year", year)
    .order("month", { ascending: true });
  if (error) throw error;
  return (data || []) as RevenueGoalRecord[];
}

export async function upsertGoal(
  year: number,
  month: number,
  amount: number,
  currency = "THB"
): Promise<void> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { error } = await sb.from("revenue_goals").upsert(
    {
      user_id: auth.user.id,
      year,
      month,
      amount,
      currency,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,year,month" }
  );
  if (error) throw error;
}

// ========================================================================
// AGGREGATE: รายเดือน + รายปี
// ========================================================================

export interface MonthlyFinanceSummary {
  year: number;
  month: number;
  incomeGross: number;
  incomeNet: number;
  whtTotal: number;
  vatCollected: number;
  expenseTotal: number;
  vatPaid: number;
  profit: number;
}

export function summarizeMonth(
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  year: number,
  month: number
): MonthlyFinanceSummary {
  const inMonth = (iso: string) => {
    const d = new Date(iso);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  };
  const incs = incomes.filter((i) => inMonth(i.received_at));
  const exps = expenses.filter((e) => inMonth(e.paid_at));

  const incomeGross = incs.reduce((acc, i) => acc + Number(i.amount), 0);
  const whtTotal = incs.reduce((acc, i) => acc + Number(i.wht_amount), 0);
  const vatCollected = incs.reduce((acc, i) => acc + Number(i.vat_amount), 0);
  const incomeNet = incomeGross - whtTotal;

  const expenseTotal = exps.reduce((acc, e) => acc + Number(e.amount), 0);
  const vatPaid = exps.reduce((acc, e) => acc + Number(e.vat_amount), 0);

  return {
    year,
    month,
    incomeGross,
    incomeNet,
    whtTotal,
    vatCollected,
    expenseTotal,
    vatPaid,
    profit: incomeNet - expenseTotal,
  };
}

// ========================================================================
// THAI PERSONAL INCOME TAX (ภงด.90/91 — simplified)
// ========================================================================
// อ้างอิงเรท 2567 (ตั้งค่าได้)
export interface TaxBracket {
  upTo: number;
  rate: number;
}

export const TAX_BRACKETS_2024: TaxBracket[] = [
  { upTo: 150000, rate: 0 },
  { upTo: 300000, rate: 0.05 },
  { upTo: 500000, rate: 0.1 },
  { upTo: 750000, rate: 0.15 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: 2000000, rate: 0.25 },
  { upTo: 5000000, rate: 0.3 },
  { upTo: Infinity, rate: 0.35 },
];

// หักค่าใช้จ่ายเป็นการเหมา 60% สูงสุดไม่เกิน 600,000 บาท
// (ใช้ได้กับฟรีแลนซ์ประเภทบริการ ม.40(2) และ ม.40(8) ที่เลือกหักเหมา)
export function computeStandardExpenseDeduction(income: number): number {
  return Math.min(income * 0.6, 600000);
}

export interface TaxInputs {
  income: number;
  useActualExpense: boolean;
  actualExpense: number;
  personalDeduction: number;
  spouseDeduction: number;
  childDeduction: number;
  parentDeduction: number;
  socialSecurity: number;
  insurancePremium: number;
  rmf: number;
  ssf: number;
  donation: number;
  otherDeduction: number;
  whtPaid: number;
}

export const DEFAULT_TAX_INPUTS: TaxInputs = {
  income: 0,
  useActualExpense: false,
  actualExpense: 0,
  personalDeduction: 60000,
  spouseDeduction: 0,
  childDeduction: 0,
  parentDeduction: 0,
  socialSecurity: 0,
  insurancePremium: 0,
  rmf: 0,
  ssf: 0,
  donation: 0,
  otherDeduction: 0,
  whtPaid: 0,
};

export interface TaxResult {
  expenseDeduction: number;
  totalDeduction: number;
  taxableIncome: number;
  taxByBracket: { bracket: TaxBracket; taxable: number; tax: number }[];
  taxTotal: number;
  whtPaid: number;
  taxOwed: number;
  effectiveRate: number;
  netAfterTax: number;
}

export function calculateThaiTax(inputs: TaxInputs): TaxResult {
  const expenseDeduction = inputs.useActualExpense
    ? Math.max(0, inputs.actualExpense)
    : computeStandardExpenseDeduction(inputs.income);

  const totalDeduction =
    inputs.personalDeduction +
    inputs.spouseDeduction +
    inputs.childDeduction +
    inputs.parentDeduction +
    inputs.socialSecurity +
    inputs.insurancePremium +
    inputs.rmf +
    inputs.ssf +
    inputs.donation +
    inputs.otherDeduction;

  const taxableIncome = Math.max(
    0,
    inputs.income - expenseDeduction - totalDeduction
  );

  const breakdown: TaxResult["taxByBracket"] = [];
  let remaining = taxableIncome;
  let lower = 0;
  let taxTotal = 0;

  for (const b of TAX_BRACKETS_2024) {
    if (remaining <= 0) break;
    const bandSize = b.upTo - lower;
    const taxable = Math.min(remaining, bandSize);
    const tax = taxable * b.rate;
    if (taxable > 0) {
      breakdown.push({ bracket: b, taxable, tax });
      taxTotal += tax;
    }
    remaining -= taxable;
    lower = b.upTo;
  }

  const taxOwed = Math.max(0, taxTotal - inputs.whtPaid);
  const effectiveRate = inputs.income > 0 ? taxTotal / inputs.income : 0;
  const netAfterTax = inputs.income - taxTotal;

  return {
    expenseDeduction,
    totalDeduction,
    taxableIncome,
    taxByBracket: breakdown,
    taxTotal,
    whtPaid: inputs.whtPaid,
    taxOwed,
    effectiveRate,
    netAfterTax,
  };
}
