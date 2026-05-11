"use client";

import { useEffect, useState } from "react";
import { fetchAdminStats, AdminStats } from "@/lib/admin";
import { fmtMoney } from "@/lib/finance-utils";
import {
  Users,
  FileText,
  FileCheck2,
  Receipt,
  MessageSquare,
  Activity,
  Star,
  Loader2,
  TrendingUp,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchAdminStats();
        if (!cancelled) setStats(s);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="bg-white/85 border border-orange-100 rounded-3xl shadow-soft py-12 text-center text-ink-400 text-sm">
        <Loader2 size={14} className="animate-spin inline mr-2" />
        กำลังโหลดสถิติ...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card
          highlight
          icon={<Users size={16} />}
          label="ผู้ใช้ทั้งหมด"
          value={stats.totalUsers.toLocaleString()}
        />
        <Card
          icon={<Activity size={16} />}
          label="Active 5 นาที"
          value={stats.activeUsers5min.toLocaleString()}
          hint={`24 ชม.: ${stats.activeUsers24h.toLocaleString()} คน`}
        />
        <Card
          icon={<FileText size={16} />}
          label="เอกสารทั้งหมด"
          value={stats.totalDocuments.toLocaleString()}
        />
        <Card
          icon={<MessageSquare size={16} />}
          label="ความคิดเห็น"
          value={stats.totalFeedback.toLocaleString()}
          hint={
            stats.avgRating > 0
              ? `เฉลี่ย ${stats.avgRating.toFixed(2)} ดาว`
              : "ยังไม่มีคะแนน"
          }
        />
      </div>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <h3 className="font-semibold text-ink-900 mb-4">รายละเอียดเอกสาร</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <DocStat
            icon={<FileText size={14} />}
            label="ใบเสนอราคา"
            value={stats.totalQuotes}
            total={stats.totalDocuments}
            color="brand"
          />
          <DocStat
            icon={<FileCheck2 size={14} />}
            label="ใบแจ้งหนี้"
            value={stats.totalInvoices}
            total={stats.totalDocuments}
            color="blue"
          />
          <DocStat
            icon={<Receipt size={14} />}
            label="ใบเสร็จรับเงิน"
            value={stats.totalReceipts}
            total={stats.totalDocuments}
            color="green"
          />
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <h3 className="font-semibold text-ink-900 mb-4">สถิติเพิ่มเติม</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <SimpleStat
            label="ลูกค้าในระบบ"
            value={stats.totalClients.toLocaleString()}
            icon={<Users size={14} />}
          />
          <SimpleStat
            label="คะแนนเฉลี่ย"
            value={
              stats.avgRating > 0
                ? `${stats.avgRating.toFixed(2)} / 5`
                : "—"
            }
            icon={<Star size={14} />}
          />
          <SimpleStat
            label="เอกสาร/ผู้ใช้"
            value={
              stats.totalUsers > 0
                ? (stats.totalDocuments / stats.totalUsers).toFixed(1)
                : "0"
            }
            icon={<TrendingUp size={14} />}
          />
        </div>
      </section>
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 transition ${
        highlight
          ? "bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-glow"
          : "bg-white/85 backdrop-blur border border-orange-100/80 text-ink-900 shadow-soft"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div
            className={`text-[11px] font-medium uppercase tracking-wide truncate ${
              highlight ? "text-white/80" : "text-ink-400"
            }`}
          >
            {label}
          </div>
          <div className="text-2xl sm:text-[28px] font-bold mt-1.5 leading-none tabular-nums">
            {value}
          </div>
          {hint && (
            <div
              className={`text-[11px] mt-2 truncate ${
                highlight ? "text-white/80" : "text-ink-400"
              }`}
            >
              {hint}
            </div>
          )}
        </div>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            highlight ? "bg-white/20 text-white" : "bg-orange-50 text-brand-500"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function DocStat({
  icon,
  label,
  value,
  total,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color: "brand" | "blue" | "green";
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const colorMap = {
    brand: { text: "text-brand-700", bg: "bg-brand-50", bar: "bg-brand-500" },
    blue: { text: "text-blue-700", bg: "bg-blue-50", bar: "bg-blue-500" },
    green: { text: "text-green-700", bg: "bg-green-50", bar: "bg-green-500" },
  }[color];
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-7 h-7 rounded-lg ${colorMap.bg} ${colorMap.text} flex items-center justify-center`}
        >
          {icon}
        </div>
        <span className="text-xs text-ink-700 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-ink-900 tabular-nums leading-none">
        {value.toLocaleString()}
      </div>
      <div className="mt-2">
        <div className="h-1.5 bg-white rounded-full overflow-hidden">
          <div
            className={`h-full ${colorMap.bar} rounded-full transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] text-ink-400 mt-1 tabular-nums">
          {pct.toFixed(1)}% ของเอกสารทั้งหมด
        </div>
      </div>
    </div>
  );
}

function SimpleStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white text-brand-500 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-ink-400">{label}</div>
        <div className="text-lg font-bold text-ink-900 tabular-nums truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
