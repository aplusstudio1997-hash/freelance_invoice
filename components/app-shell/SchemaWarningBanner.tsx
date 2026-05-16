"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { AlertTriangle, X, Copy, Check } from "lucide-react";

export default function SchemaWarningBanner() {
  const { user } = useAuth();
  const [missing, setMissing] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const sb = getSupabase();
      const TABLES = [
        "profiles",
        "clients",
        "documents",
        "incomes",
        "expenses",
        "revenue_goals",
        "subscriptions",
        "suppliers",
        "active_sessions",
      ];
      const results = await Promise.all(
        TABLES.map(async (t) => {
          const { error } = await sb
            .from(t)
            .select("*", { count: "exact", head: true })
            .limit(1);
          if (
            error &&
            (error.code === "PGRST205" ||
              error.code === "42P01" ||
              error.code === "42703")
          ) {
            return t;
          }
          return null;
        })
      );
      if (cancelled) return;
      const miss = results.filter((t): t is string => t !== null);
      setMissing(miss);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const copySchema = async () => {
    try {
      const res = await fetch("/schema.sql");
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open("/schema.sql", "_blank");
    }
  };

  if (dismissed || missing.length === 0) return null;

  return (
    <div className="px-3 sm:px-6 pt-3 sm:pt-4">
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl shadow-soft p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-amber-900 text-sm sm:text-base">
              ต้องตั้งค่า Database ก่อนใช้งาน
            </div>
            <div className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
              ตอนนี้ Supabase ยังไม่มีตาราง:{" "}
              <span className="font-mono font-semibold">
                {missing.join(", ")}
              </span>
            </div>
            <div className="text-xs text-amber-700 mt-2">
              <strong>วิธีแก้:</strong> เปิด Supabase Dashboard →{" "}
              <strong>SQL Editor</strong> → New query → วางเนื้อหาจากไฟล์{" "}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded">
                supabase/schema.sql
              </code>{" "}
              → กด <strong>Run</strong>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={copySchema}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition"
              >
                {copied ? (
                  <>
                    <Check size={12} />
                    คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    คัดลอก schema.sql
                  </>
                )}
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-medium transition"
              >
                เปิด Supabase Dashboard →
              </a>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 w-7 h-7 rounded-full hover:bg-amber-100 text-amber-700 flex items-center justify-center transition"
            aria-label="ปิด"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
