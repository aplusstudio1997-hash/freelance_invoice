"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export interface PlaceholderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
  comingPhase?: string;
}

export default function PlaceholderPage({
  icon,
  title,
  description,
  features,
  comingPhase,
}: PlaceholderProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-ink-900">{title}</h2>
              {comingPhase && (
                <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-brand-700 font-medium">
                  <Sparkles size={10} />
                  เร็ว ๆ นี้ — {comingPhase}
                </span>
              )}
            </div>
            <p className="text-sm text-ink-600 mt-1">{description}</p>
          </div>
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-8 sm:p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center shadow-glow mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-ink-900">
          ฟีเจอร์นี้กำลังพัฒนา
        </h3>
        <p className="text-sm text-ink-600 mt-2 max-w-md mx-auto">
          ระหว่างนี้ใช้ฟีเจอร์อื่นไปก่อนได้เลย —
          เราจะแจ้งเตือนทันทีที่เปิดให้ใช้งาน
        </p>

        {features && features.length > 0 && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="text-xs font-semibold text-ink-700 mb-3 text-left">
              สิ่งที่จะมีในฟีเจอร์นี้
            </div>
            <ul className="space-y-2 text-left">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-ink-600 bg-orange-50/50 border border-orange-100 rounded-xl px-3.5 py-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/app/dashboard"
          className="mt-7 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-medium transition shadow-soft"
        >
          กลับหน้า Dashboard
          <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
