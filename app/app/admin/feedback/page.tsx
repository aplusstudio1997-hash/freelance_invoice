"use client";

import { useEffect, useMemo, useState } from "react";
import { listAllFeedback, AdminFeedback } from "@/lib/admin";
import { fmtDateDisplay, downloadCsv } from "@/lib/finance-utils";
import {
  MessageSquare,
  Search,
  Star,
  Download,
  Loader2,
} from "lucide-react";

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listAllFeedback();
        if (!cancelled) setItems(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((f) => {
      if (ratingFilter !== "all" && f.rating !== ratingFilter) return false;
      if (!q) return true;
      return (
        f.message.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
      );
    });
  }, [items, search, ratingFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const rated = items.filter((f) => f.rating > 0);
    const avg =
      rated.length > 0
        ? rated.reduce((a, b) => a + Number(b.rating), 0) / rated.length
        : 0;
    const breakdown = [1, 2, 3, 4, 5].map((r) => ({
      stars: r,
      count: items.filter((f) => f.rating === r).length,
      pct:
        rated.length > 0
          ? (items.filter((f) => f.rating === r).length / rated.length) * 100
          : 0,
    }));
    return { total, avg, breakdown };
  }, [items]);

  const exportCsv = () => {
    const rows: string[][] = [
      ["created_at", "user_id", "email", "rating", "message"],
      ...filtered.map((f) => [
        f.created_at,
        f.user_id || "",
        f.email,
        String(f.rating),
        f.message,
      ]),
    ];
    downloadCsv(
      `feedback-${new Date().toISOString().slice(0, 10)}.csv`,
      rows
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] text-ink-400 uppercase tracking-wide">
              คะแนนเฉลี่ย
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-ink-900 tabular-nums">
                {stats.avg > 0 ? stats.avg.toFixed(2) : "—"}
              </span>
              <span className="text-sm text-ink-400">/ 5</span>
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={
                    s <= Math.round(stats.avg)
                      ? "fill-amber-400 text-amber-400"
                      : "text-ink-200"
                  }
                />
              ))}
            </div>
            <div className="text-[11px] text-ink-400 mt-2">
              จาก {stats.total} ความคิดเห็น
            </div>
          </div>

          <div className="space-y-1.5">
            {stats.breakdown
              .slice()
              .reverse()
              .map((b) => (
                <div
                  key={b.stars}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="w-3 text-ink-500 tabular-nums shrink-0">
                    {b.stars}
                  </span>
                  <Star
                    size={11}
                    className="fill-amber-400 text-amber-400 shrink-0"
                  />
                  <div className="flex-1 h-1.5 bg-orange-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                  <span className="text-ink-500 tabular-nums w-8 text-right shrink-0">
                    {b.count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ข้อความ หรืออีเมล"
              className="w-full pl-9 pr-3.5 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(
                e.target.value === "all"
                  ? "all"
                  : (parseInt(e.target.value) as number)
              )
            }
            className="px-3.5 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white cursor-pointer"
          >
            <option value="all">ทุกคะแนน</option>
            <option value="5">5 ดาว</option>
            <option value="4">4 ดาว</option>
            <option value="3">3 ดาว</option>
            <option value="2">2 ดาว</option>
            <option value="1">1 ดาว</option>
          </select>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-white text-xs font-medium transition shadow-soft"
          >
            <Download size={12} />
            CSV
          </button>
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">
            <Loader2 size={14} className="animate-spin mr-2" />
            กำลังโหลด...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-50 text-brand-300 flex items-center justify-center mb-3">
              <MessageSquare size={22} />
            </div>
            <div className="text-sm font-medium text-ink-700">
              ยังไม่มีความคิดเห็น
            </div>
          </div>
        ) : (
          <div className="divide-y divide-orange-100">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="px-4 sm:px-5 py-4 hover:bg-orange-50/30 transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= f.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-ink-200"
                        }
                      />
                    ))}
                    <span className="text-xs text-ink-500 ml-1 tabular-nums">
                      {f.rating}/5
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-400">
                    {fmtDateDisplay(f.created_at)}
                  </div>
                </div>
                {f.message ? (
                  <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">
                    {f.message}
                  </p>
                ) : (
                  <p className="text-sm text-ink-400 italic">
                    (ไม่มีข้อความ — ให้แค่คะแนน)
                  </p>
                )}
                {f.email && (
                  <div className="text-[11px] text-ink-400 mt-2">
                    {f.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
