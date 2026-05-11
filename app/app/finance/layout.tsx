"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDocuments } from "@/lib/documents";
import { getCurrencySymbol } from "@/lib/types";
import {
  Wallet,
  FileText,
  TrendingUp,
  TrendingDown,
  Calculator,
  Save,
} from "lucide-react";
import {
  listIncomes,
  listExpenses,
  summarizeMonth,
} from "@/lib/finance";
import { fmtMoney } from "@/lib/finance-utils";

const SUB_TABS = [
  {
    href: "/app/finance/documents",
    label: "เอกสาร",
    icon: FileText,
  },
  {
    href: "/app/finance/income",
    label: "รายรับ",
    icon: TrendingUp,
  },
  {
    href: "/app/finance/expense",
    label: "รายจ่าย",
    icon: TrendingDown,
  },
  {
    href: "/app/finance/tax",
    label: "ภาษี",
    icon: Calculator,
  },
] as const;

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, saveStatus } = useDocuments();
  const sym = getCurrencySymbol(profile.currency);

  const [summary, setSummary] = useState({
    incomeGross: 0,
    expenseTotal: 0,
    profit: 0,
    whtTotal: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const [incs, exps] = await Promise.all([
          listIncomes(`${y}-01-01`, `${y}-12-31`),
          listExpenses(`${y}-01-01`, `${y}-12-31`),
        ]);
        const s = summarizeMonth(incs, exps, y, m);
        if (!cancelled) {
          setSummary({
            incomeGross: s.incomeGross,
            expenseTotal: s.expenseTotal,
            profit: s.profit,
            whtTotal: incs.reduce((a, i) => a + Number(i.wht_amount), 0),
          });
        }
      } catch {}
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const status =
    saveStatus === "saving"
      ? "saving"
      : saveStatus === "saved"
        ? "saved"
        : "";

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-ink-900">
                Finance &amp; Tax
              </h2>
              {status && (
                <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-brand-700">
                  <Save size={10} />
                  {status === "saving" ? "กำลังบันทึก..." : "บันทึกแล้ว"}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              สร้างเอกสาร บันทึกรายรับ-จ่าย และดูสรุปภาษีรายปี
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <MiniStat
            label="รายรับเดือนนี้"
            value={`${sym}${fmtMoney(summary.incomeGross)}`}
            icon={<TrendingUp size={12} />}
            tone="positive"
          />
          <MiniStat
            label="รายจ่ายเดือนนี้"
            value={`${sym}${fmtMoney(summary.expenseTotal)}`}
            icon={<TrendingDown size={12} />}
            tone="negative"
          />
          <MiniStat
            label="กำไรเดือนนี้"
            value={`${sym}${fmtMoney(summary.profit)}`}
            icon={<Wallet size={12} />}
            tone={summary.profit >= 0 ? "positive" : "negative"}
          />
          <MiniStat
            label="WHT สะสมปี"
            value={`${sym}${fmtMoney(summary.whtTotal)}`}
            icon={<FileText size={12} />}
          />
        </div>
      </section>

      <div className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-full shadow-soft p-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                active
                  ? "bg-ink-900 text-white shadow-soft"
                  : "text-ink-600 hover:text-ink-900 hover:bg-orange-50"
              }`}
            >
              <Icon size={13} />
              <span className="whitespace-nowrap">{t.label}</span>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-ink-400 uppercase tracking-wide truncate">
          {label}
        </span>
        <span
          className={`shrink-0 ${
            tone === "positive"
              ? "text-green-600"
              : tone === "negative"
                ? "text-rose-600"
                : "text-ink-400"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="text-base font-bold text-ink-900 tabular-nums mt-0.5">
        {value}
      </div>
    </div>
  );
}
