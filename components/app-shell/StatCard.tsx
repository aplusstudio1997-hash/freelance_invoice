"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  href?: string;
  highlight?: boolean;
  trend?: string;
}

export default function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  highlight,
  trend,
}: StatCardProps) {
  const inner = (
    <div
      className={`relative rounded-3xl p-4 sm:p-5 transition group ${
        highlight
          ? "bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-glow"
          : "bg-white/85 backdrop-blur border border-orange-100/80 text-ink-900 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5"
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
            highlight
              ? "bg-white/20 text-white"
              : "bg-orange-50 text-brand-500 group-hover:bg-brand-50"
          }`}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div
          className={`absolute top-3 right-12 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
            highlight ? "bg-white/15 text-white" : "bg-green-50 text-green-700"
          }`}
        >
          <ArrowUpRight size={9} />
          {trend}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
