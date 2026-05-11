import { getSupabase } from "./supabase";

export interface AdminUserSummary {
  user_id: string;
  studio_name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
  document_count: number;
  client_count: number;
  income_total: number;
  expense_total: number;
  last_active_at: string | null;
}

export interface AdminFeedback {
  id: string;
  user_id: string | null;
  email: string;
  rating: number;
  message: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDocuments: number;
  totalQuotes: number;
  totalInvoices: number;
  totalReceipts: number;
  totalClients: number;
  totalFeedback: number;
  avgRating: number;
  activeUsers5min: number;
  activeUsers24h: number;
}

export async function isAdmin(): Promise<boolean> {
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return false;
  const { data } = await sb
    .from("profiles")
    .select("role")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  return data?.role === "admin";
}

// ========================================================================
// FETCH ALL USERS (admin policy เปิดให้อ่านได้ทุกแถว)
// ========================================================================
export async function listAllUsers(): Promise<AdminUserSummary[]> {
  const sb = getSupabase();

  const { data: profiles, error: pErr } = await sb
    .from("profiles")
    .select("user_id, data, role, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (pErr) throw pErr;
  if (!profiles || profiles.length === 0) return [];

  const ids = profiles.map((p) => p.user_id);

  const [docsRes, clientsRes, incomeRes, expenseRes, sessRes] =
    await Promise.all([
      sb.from("documents").select("user_id, type").in("user_id", ids),
      sb.from("clients").select("user_id").in("user_id", ids),
      sb.from("incomes").select("user_id, amount").in("user_id", ids),
      sb.from("expenses").select("user_id, amount").in("user_id", ids),
      sb
        .from("active_sessions")
        .select("user_id, last_seen")
        .in("user_id", ids),
    ]);

  const docCount = new Map<string, number>();
  (docsRes.data || []).forEach((d) => {
    docCount.set(d.user_id as string, (docCount.get(d.user_id as string) || 0) + 1);
  });

  const clientCount = new Map<string, number>();
  (clientsRes.data || []).forEach((c) => {
    clientCount.set(
      c.user_id as string,
      (clientCount.get(c.user_id as string) || 0) + 1
    );
  });

  const incomeTotal = new Map<string, number>();
  (incomeRes.data || []).forEach((i) => {
    incomeTotal.set(
      i.user_id as string,
      (incomeTotal.get(i.user_id as string) || 0) + Number(i.amount)
    );
  });

  const expenseTotal = new Map<string, number>();
  (expenseRes.data || []).forEach((e) => {
    expenseTotal.set(
      e.user_id as string,
      (expenseTotal.get(e.user_id as string) || 0) + Number(e.amount)
    );
  });

  const lastSeen = new Map<string, string>();
  (sessRes.data || []).forEach((s) => {
    if (!s.user_id) return;
    const cur = lastSeen.get(s.user_id as string);
    const ts = s.last_seen as string;
    if (!cur || ts > cur) lastSeen.set(s.user_id as string, ts);
  });

  return profiles.map((p) => {
    const data = (p.data as { studioName?: string; email?: string }) || {};
    return {
      user_id: p.user_id as string,
      studio_name: data.studioName || "—",
      email: data.email || "—",
      role: (p.role as "user" | "admin") || "user",
      created_at: p.created_at as string,
      updated_at: p.updated_at as string,
      document_count: docCount.get(p.user_id as string) || 0,
      client_count: clientCount.get(p.user_id as string) || 0,
      income_total: incomeTotal.get(p.user_id as string) || 0,
      expense_total: expenseTotal.get(p.user_id as string) || 0,
      last_active_at: lastSeen.get(p.user_id as string) || null,
    };
  });
}

// ========================================================================
// FEEDBACK (admin)
// ========================================================================
export async function listAllFeedback(): Promise<AdminFeedback[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AdminFeedback[];
}

// ========================================================================
// SYSTEM-WIDE STATS
// ========================================================================
export async function fetchAdminStats(): Promise<AdminStats> {
  const sb = getSupabase();
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    usersRes,
    quotesRes,
    invoicesRes,
    receiptsRes,
    clientsRes,
    feedbackData,
    active5min,
    active24h,
  ] = await Promise.all([
    sb.from("profiles").select("*", { count: "exact", head: true }),
    sb
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("type", "quote"),
    sb
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("type", "invoice"),
    sb
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("type", "receipt"),
    sb.from("clients").select("*", { count: "exact", head: true }),
    sb.from("feedback").select("rating"),
    sb
      .from("active_sessions")
      .select("*", { count: "exact", head: true })
      .gte("last_seen", fiveMinAgo),
    sb
      .from("active_sessions")
      .select("*", { count: "exact", head: true })
      .gte("last_seen", dayAgo),
  ]);

  const ratings = (feedbackData.data || [])
    .map((f) => Number(f.rating))
    .filter((r) => r > 0);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  const totalQuotes = quotesRes.count || 0;
  const totalInvoices = invoicesRes.count || 0;
  const totalReceipts = receiptsRes.count || 0;

  return {
    totalUsers: usersRes.count || 0,
    totalDocuments: totalQuotes + totalInvoices + totalReceipts,
    totalQuotes,
    totalInvoices,
    totalReceipts,
    totalClients: clientsRes.count || 0,
    totalFeedback: (feedbackData.data || []).length,
    avgRating,
    activeUsers5min: active5min.count || 0,
    activeUsers24h: active24h.count || 0,
  };
}
