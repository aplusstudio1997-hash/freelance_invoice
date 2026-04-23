import { QuoteSettings, Profile } from "./types";
import { CalcResult } from "./calc";

const GAS_URL =
  process.env.NEXT_PUBLIC_GAS_URL ||
  "https://script.google.com/macros/s/REPLACE_WITH_YOUR_GAS_DEPLOYMENT_ID/exec";

export interface FeedbackPayload {
  email: string;
  rating: number;
  message: string;
}

export interface QuotePayload {
  quoteNumber: string;
  projectName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  preDiscount: number;
  vatAmount: number;
  discountValue: number;
  taxDeduction: number;
  total: number;
  deposit: number;
  paymentCondition: string;
  preparedBy: string;
  raw: string;
}

async function postNoCors(type: string, payload: unknown): Promise<void> {
  if (!GAS_URL || GAS_URL.includes("REPLACE_WITH_YOUR")) {
    console.warn("GAS_URL not configured; skipping send", type, payload);
    return;
  }
  try {
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type, payload }),
    });
  } catch (e) {
    console.error("postNoCors failed", e);
  }
}

export function sendFeedback(p: FeedbackPayload): Promise<void> {
  return postNoCors("feedback", p);
}

export function sendQuote(
  q: QuoteSettings,
  calc: CalcResult,
  profile: Profile
): Promise<void> {
  const payload: QuotePayload = {
    quoteNumber: q.quoteNumber || "",
    projectName: q.projectName || "",
    customerName: q.customer.name || "",
    customerPhone: q.customer.phone || "",
    customerEmail: q.customer.email || "",
    startDate: q.startDate || "",
    endDate: q.endDate || "",
    preDiscount: round(calc.preDiscount),
    vatAmount: round(calc.vatAmount),
    discountValue: round(calc.discountValue),
    taxDeduction: round(calc.taxDeduction),
    total: round(calc.total),
    deposit: round(calc.deposit),
    paymentCondition: q.paymentCondition || "",
    preparedBy: profile.ownerName || profile.studioName || "",
    raw: JSON.stringify({ quote: q, profile, calc }),
  };
  return postNoCors("quote", payload);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
