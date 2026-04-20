import { QuoteSettings, DEFAULT_QUOTE } from "./types";

const STORAGE_KEY = "freelance-solo-draft";
const SESSION_KEY = "freelance-solo-session";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function saveDraft(data: QuoteSettings): void {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      sessionId: getSessionId(),
      updatedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("saveDraft failed", e);
  }
}

export function loadDraft(): QuoteSettings {
  if (typeof window === "undefined") return DEFAULT_QUOTE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_QUOTE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_QUOTE, ...(parsed.data ?? {}) };
  } catch {
    return DEFAULT_QUOTE;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
