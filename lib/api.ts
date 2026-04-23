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

export interface StatsResponse {
  totalQuotes: number;
  activeUsers: number;
}

function getClientId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "freelance-solo-cid";
  let cid = localStorage.getItem(KEY);
  if (!cid) {
    cid = `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, cid);
  }
  return cid;
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
  _q: QuoteSettings,
  _calc: CalcResult,
  _profile: Profile
): Promise<void> {
  return postNoCors("quote", { clientId: getClientId() });
}

export async function fetchStats(): Promise<StatsResponse | null> {
  if (!GAS_URL || GAS_URL.includes("REPLACE_WITH_YOUR")) return null;
  try {
    const res = await fetch(`${GAS_URL}?action=stats`, { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.totalQuotes !== "number") return null;
    return {
      totalQuotes: Number(data.totalQuotes) || 0,
      activeUsers: Number(data.activeUsers) || 0,
    };
  } catch (e) {
    console.error("fetchStats failed", e);
    return null;
  }
}

export function pingActive(): Promise<void> {
  return postNoCors("ping", { clientId: getClientId() });
}
