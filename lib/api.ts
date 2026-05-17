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
}

// ========================================================================
// STATS — totalQuotes (documents quote count)
// ========================================================================
export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const sb = getSupabase();
    const quotesRes = await sb
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("type", "quote");
    return {
      totalQuotes: quotesRes.count || 0,
    };
  } catch (e) {
    console.warn("fetchStats failed", e);
    return null;
  }
}

// ========================================================================
// FEEDBACK — บันทึกลง public.feedback
// ========================================================================
// Returns true on success, false on failure so callers can surface an error
// to the user instead of silently dropping the message.
export async function sendFeedback(payload: FeedbackPayload): Promise<boolean> {
  try {
    const sb = getSupabase();
    const { data: auth } = await sb.auth.getUser();
    const { error } = await sb.from("feedback").insert({
      user_id: auth.user?.id || null,
      email: payload.email || auth.user?.email || "",
      rating: payload.rating,
      message: payload.message,
    });
    if (error) {
      console.warn("sendFeedback failed", error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("sendFeedback failed", e);
    return false;
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
