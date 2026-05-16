import { getSupabase } from "./supabase";
import { isSchemaMissing } from "./repository";

export type BillingCycle = "monthly" | "yearly" | "quarterly" | "weekly";

export type SubCategory =
  | "software"
  | "hosting"
  | "domain"
  | "design_tool"
  | "ai_tool"
  | "stock_asset"
  | "music"
  | "video"
  | "communication"
  | "marketing"
  | "storage"
  | "other";

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  name: string;
  category: SubCategory;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_at: string | null;
  active: boolean;
  notify_days: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInput {
  name: string;
  category: SubCategory;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingAt?: string | null;
  active: boolean;
  notifyDays: number;
  note?: string;
}

export async function listSubscriptions(): Promise<SubscriptionRecord[]> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await sb
    .from("subscriptions")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("next_billing_at", { ascending: true, nullsFirst: false });
  if (error) {
    if (isSchemaMissing(error)) return [];
    throw error;
  }
  return (data || []) as SubscriptionRecord[];
}

export async function createSubscription(
  input: SubscriptionInput
): Promise<SubscriptionRecord> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { data, error } = await sb
    .from("subscriptions")
    .insert({
      user_id: auth.user.id,
      name: input.name,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      billing_cycle: input.billingCycle,
      next_billing_at: input.nextBillingAt || null,
      active: input.active,
      notify_days: input.notifyDays,
      note: input.note || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data as SubscriptionRecord;
}

export async function updateSubscription(
  id: string,
  patch: Partial<SubscriptionInput>
): Promise<void> {
  const sb = getSupabase();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.amount !== undefined) update.amount = patch.amount;
  if (patch.currency !== undefined) update.currency = patch.currency;
  if (patch.billingCycle !== undefined) update.billing_cycle = patch.billingCycle;
  if (patch.nextBillingAt !== undefined)
    update.next_billing_at = patch.nextBillingAt || null;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.notifyDays !== undefined) update.notify_days = patch.notifyDays;
  if (patch.note !== undefined) update.note = patch.note;
  const { error } = await sb
    .from("subscriptions")
    .update(update)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSubscription(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("subscriptions").delete().eq("id", id);
  if (error) throw error;
}

// ========================================================================
// HELPERS
// ========================================================================

export function monthlyEquivalent(s: SubscriptionRecord): number {
  if (!s.active) return 0;
  const amt = Number(s.amount);
  switch (s.billing_cycle) {
    case "monthly":
      return amt;
    case "yearly":
      return amt / 12;
    case "quarterly":
      return amt / 3;
    case "weekly":
      return amt * 4.345;
    default:
      return amt;
  }
}

export function yearlyEquivalent(s: SubscriptionRecord): number {
  if (!s.active) return 0;
  const amt = Number(s.amount);
  switch (s.billing_cycle) {
    case "monthly":
      return amt * 12;
    case "yearly":
      return amt;
    case "quarterly":
      return amt * 4;
    case "weekly":
      return amt * 52;
    default:
      return amt * 12;
  }
}

// Parse "YYYY-MM-DD" as a LOCAL date so timezone offset doesn't shift the day.
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

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = parseLocalDate(iso);
  if (!target) return null;
  const now = new Date();
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function nextBillingAfter(
  current: string,
  cycle: BillingCycle
): string {
  const d = parseLocalDate(current);
  if (!d) return current;
  // Clamp the day-of-month after incrementing the month so e.g. Jan 31 + 1
  // month becomes Feb 28/29 instead of overflowing to March 3.
  const addMonths = (date: Date, n: number): Date => {
    const originalDay = date.getDate();
    const candidate = new Date(date.getFullYear(), date.getMonth() + n, 1);
    const lastDay = new Date(
      candidate.getFullYear(),
      candidate.getMonth() + 1,
      0
    ).getDate();
    candidate.setDate(Math.min(originalDay, lastDay));
    return candidate;
  };

  let next: Date;
  switch (cycle) {
    case "monthly":
      next = addMonths(d, 1);
      break;
    case "yearly":
      next = addMonths(d, 12);
      break;
    case "quarterly":
      next = addMonths(d, 3);
      break;
    case "weekly":
      next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
      break;
    default:
      next = d;
  }
  return formatLocalDate(next);
}
