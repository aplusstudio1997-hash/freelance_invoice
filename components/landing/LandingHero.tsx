"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Wallet,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function LandingHero() {
  const { user, loading } = useAuth();
  const ctaHref = user ? "/app" : "/auth";
  const ctaLabel = user ? "เข้าใช้งาน" : "เริ่มใช้ฟรี";

  return (
    <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-slideUp">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur border border-brand-200/60 text-xs text-brand-700 font-medium mb-5 shadow-soft">
              <Sparkles size={12} />
              เปิดให้ใช้งานช่วง Beta — ฟรี
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-900 leading-tight tracking-tight">
              หลังบ้านฟรีแลนซ์
              <br />
              <span className="bg-gradient-to-r from-brand-500 via-brand-400 to-peach-400 bg-clip-text text-transparent">
                ของคุณ
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-ink-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              ระบบจัดการเอกสาร รายได้ ภาษี ลูกค้า และ Subscription
              สำหรับฟรีแลนซ์ — ครบในที่เดียว ใช้ฟรีตลอดช่วง Beta
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {!loading && (
                <Link
                  href={ctaHref}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-ink-900 hover:bg-ink-800 text-white font-medium text-sm transition shadow-soft-lg"
                >
                  {ctaLabel}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition"
                  />
                </Link>
              )}
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/70 backdrop-blur border border-orange-200/60 hover:bg-white text-ink-800 font-medium text-sm transition"
              >
                ดูฟีเจอร์
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-xs text-ink-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                ไม่ต้องผูกบัตรเครดิต
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                ใช้งานได้ทันที
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-6 bg-gradient-to-br from-brand-300/30 via-peach-300/40 to-transparent blur-3xl rounded-full" />
            <div className="relative bg-white/80 backdrop-blur rounded-3xl border border-orange-100 shadow-soft-lg p-5 sm:p-6 animate-slideUp">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs text-ink-400">ภาพรวมเดือนนี้</div>
                  <div className="text-xl font-bold text-ink-900">฿128,500</div>
                </div>
                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                  <TrendingUp size={11} />
                  +24%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                <MiniStat
                  icon={<FileText size={14} />}
                  label="เอกสาร"
                  value="24"
                  tone="orange"
                />
                <MiniStat
                  icon={<Users size={14} />}
                  label="ลูกค้า"
                  value="12"
                  tone="peach"
                />
                <MiniStat
                  icon={<Wallet size={14} />}
                  label="ใบเสร็จ"
                  value="8"
                  tone="orange"
                />
                <MiniStat
                  icon={<Calendar size={14} />}
                  label="Subs"
                  value="6"
                  tone="peach"
                />
              </div>

              <div className="space-y-2">
                <MiniRow
                  title="Brand X — Logo Design"
                  amount="฿35,000"
                  status="ชำระแล้ว"
                  positive
                />
                <MiniRow
                  title="Studio Y — Website"
                  amount="฿58,000"
                  status="รอชำระ"
                />
                <MiniRow
                  title="Agency Z — Branding"
                  amount="฿35,500"
                  status="ดราฟต์"
                />
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2 sm:-right-6 bg-ink-900 text-white rounded-2xl px-4 py-3 shadow-soft-lg animate-float hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <div>
                  <div className="text-xs text-ink-200">AI ช่วยประเมิน</div>
                  <div className="text-xs font-semibold">฿42,000 — ฿58,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "orange" | "peach";
}) {
  const cls =
    tone === "orange"
      ? "bg-brand-50 text-brand-700 border-brand-100"
      : "bg-peach-50 text-peach-500 border-peach-100";
  return (
    <div className={`rounded-xl border ${cls} p-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <div className="text-base font-bold mt-1">{value}</div>
    </div>
  );
}

function MiniRow({
  title,
  amount,
  status,
  positive,
}: {
  title: string;
  amount: string;
  status: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-peach-50/60 hover:bg-peach-50 transition">
      <div className="min-w-0">
        <div className="text-xs font-medium text-ink-800 truncate">{title}</div>
        <div
          className={`text-xs mt-0.5 ${
            positive ? "text-green-600" : "text-ink-400"
          }`}
        >
          {status}
        </div>
      </div>
      <div className="text-xs font-semibold text-ink-900 tabular-nums">
        {amount}
      </div>
    </div>
  );
}
