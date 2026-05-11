import { QuoteSettings, Profile } from "./types";
import { CalcResult } from "./calc";
import { getSupabase } from "./supabase";

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

// ========================================================================
// ACTIVE SESSIONS (heartbeat) — รายงาน "active" ทุกนาที
// ========================================================================
export async function pingActive(): Promise<void> {
  const cid = getClientId();
  if (!cid) return;
  try {
    const sb = getSupabase();
    const { data: auth } = await sb.auth.getUser();
    await sb.from("active_sessions").upsert(
      {
        client_id: cid,
        user_id: auth.user?.id || null,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    );
  } catch (e) {
    console.warn("pingActive failed", e);
  }
}

// ========================================================================
// STATS — totalQuotes (documents quote count) + activeUsers (5 minute)
// ========================================================================
export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const sb = getSupabase();
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const [quotesRes, activeRes] = await Promise.all([
      sb
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("type", "quote"),
      sb
        .from("active_sessions")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", fiveMinAgo),
    ]);
    return {
      totalQuotes: quotesRes.count || 0,
      activeUsers: activeRes.count || 0,
    };
  } catch (e) {
    console.warn("fetchStats failed", e);
    return null;
  }
}

// ========================================================================
// FEEDBACK — บันทึกลง public.feedback
// ========================================================================
export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  try {
    const sb = getSupabase();
    const { data: auth } = await sb.auth.getUser();
    await sb.from("feedback").insert({
      user_id: auth.user?.id || null,
      email: payload.email || auth.user?.email || "",
      rating: payload.rating,
      message: payload.message,
    });
  } catch (e) {
    console.warn("sendFeedback failed", e);
  }
}

// ========================================================================
// QUOTE STATS — placeholder (used by SuccessModal previously)
// เก็บไว้เพื่อ backward-compat กับโค้ดเดิม — ไม่ทำอะไร
// ========================================================================
export async function sendQuote(
  _data: QuoteSettings,
  _calc: CalcResult,
  _profile: Profile
): Promise<void> {
  // No-op now — เอกสารถูกบันทึกใน documents table โดย DocumentProvider
}
