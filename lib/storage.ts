import {
  QuoteSettings,
  DEFAULT_QUOTE,
  DEFAULT_EXTRAS,
  DEFAULT_DIFFICULTIES,
  Profile,
  DEFAULT_PROFILE,
  DEFAULT_PAYMENT,
  ExtraOption,
} from "./types";

const STORAGE_KEY = "freelance-solo-draft";
const SESSION_KEY = "freelance-solo-session";
const PROFILE_KEY = "freelance-solo-profile";

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
    const d = parsed.data ?? {};

    const merged: QuoteSettings = { ...DEFAULT_QUOTE, ...d };
    if (!Array.isArray(merged.extras) || merged.extras.length === 0) {
      merged.extras = DEFAULT_EXTRAS;
    }
    if (!Array.isArray((merged as QuoteSettings & { difficulties?: ExtraOption[] }).difficulties)) {
      const legacy = d as { difficultCommunication?: boolean; frequentChanges?: boolean };
      merged.difficulties = DEFAULT_DIFFICULTIES.map((x) => {
        if (x.id === "difficult_communication")
          return { ...x, enabled: !!legacy.difficultCommunication };
        if (x.id === "frequent_changes")
          return { ...x, enabled: !!legacy.frequentChanges };
        return x;
      });
    }
    if (!Array.isArray(merged.milestones)) {
      merged.milestones = [];
    }
    if (typeof merged.billableFromRevision !== "number" || merged.billableFromRevision < 1) {
      merged.billableFromRevision = 4;
    }
    if (typeof merged.vat7 !== "boolean") merged.vat7 = false;
    if (typeof merged.tax3Percent !== "boolean") merged.tax3Percent = false;
    merged.services = (merged.services || []).map((s) => ({
      ...s,
      quantity: s.quantity && s.quantity > 0 ? s.quantity : 1,
    }));
    return merged;
  } catch {
    return DEFAULT_QUOTE;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("saveProfile failed", e);
  }
}

export function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    const merged: Profile = { ...DEFAULT_PROFILE, ...parsed };
    merged.payment = { ...DEFAULT_PAYMENT, ...(parsed.payment || {}) };
    if (typeof merged.socialLink !== "string") merged.socialLink = "";
    return merged;
  } catch {
    return DEFAULT_PROFILE;
  }
}
