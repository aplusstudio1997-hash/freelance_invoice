"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useDocuments } from "@/lib/documents";
import { getCurrencySymbol } from "@/lib/types";
import StatCard from "@/components/app-shell/StatCard";
import GoalModal from "@/components/finance/GoalModal";
import AiPriceCheckModal from "@/components/dashboard/AiPriceCheckModal";
import {
  listIncomes,
  listExpenses,
  summarizeMonth,
  getGoal,
  RevenueGoalRecord,
} from "@/lib/finance";
import {
  listSubscriptions,
  SubscriptionRecord,
  monthlyEquivalent,
} from "@/lib/subscriptions";
import { fmtMoney } from "@/lib/finance-utils";
import {
  Target,
  Pencil,
  TrendingUp,
  Receipt,
  Repeat,
  Users,
  AlertTriangle,
  Sparkles,
  History,
  Wallet,
  Briefcase,
  UserCog,
  Bell,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { documents, clients, profile } = useDocuments();

  const studioName =
    (user?.user_metadata?.studio_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "freelancer";

  const sym = getCurrencySymbol(profile.currency);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [goal, setGoal] = useState<RevenueGoalRecord | null>(null);
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);
  const [summary, setSummary] = useState({
    incomeGross: 0,
    incomeNet: 0,
    expenseTotal: 0,
    profit: 0,
    whtTotal: 0,
  });
  const [goalOpen, setGoalOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const refresh = async () => {
    try {
      const [incs, exps, g, s] = await Promise.all([
        listIncomes(`${year}-01-01`, `${year}-12-31`),
        listExpenses(`${year}-01-01`, `${year}-12-31`),
        getGoal(year, month),
        listSubscriptions(),
      ]);
      const sum = summarizeMonth(incs, exps, year, month);
      setSummary({
        incomeGross: sum.incomeGross,
        incomeNet: sum.incomeNet,
        expenseTotal: sum.expenseTotal,
        profit: sum.profit,
        whtTotal: incs.reduce((a, i) => a + Number(i.wht_amount), 0),
      });
      setGoal(g);
      setSubs(s);
    } catch {}
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const invoices = documents.filter((d) => d.type === "invoice").length;
    const receipts = documents.filter((d) => d.type === "receipt").length;
    const quotes = documents.filter((d) => d.type === "quote").length;
    return { invoices, receipts, quotes };
  }, [documents]);

  const goalAmount = goal ? Number(goal.amount) : 0;
  const goalProgress =
    goalAmount > 0 ? Math.min(100, (summary.incomeGross / goalAmount) * 100) : 0;

  const activeSubs = subs.filter((s) => s.active);
  const subsMonthlyTHB = activeSubs
    .filter((s) => s.currency === "THB")
    .reduce((a, s) => a + monthlyEquivalent(s), 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      <Greeting name={studioName} />

      <RevenueGoal
        currency={sym}
        amount={goalAmount}
        progress={goalProgress}
        income={summary.incomeGross}
        onEdit={() => setGoalOpen(true)}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          highlight
          label="รายได้เดือนนี้"
          value={`${sym}${fmtMoney(summary.incomeGross)}`}
          hint={
            goalAmount > 0
              ? `จากเป้า ${sym}${fmtMoney(goalAmount)} (${goalProgress.toFixed(0)}%)`
              : "ตั้งเป้ารายได้ด้านบน"
          }
          icon={<TrendingUp size={16} />}
          href="/app/finance/income"
        />
        <StatCard
          label="รายจ่ายเดือนนี้"
          value={`${sym}${fmtMoney(summary.expenseTotal)}`}
          hint={`สุทธิ ${sym}${fmtMoney(summary.profit)}`}
          icon={<Receipt size={16} />}
          href="/app/finance/expense"
        />
        <StatCard
          label="Subscriptions ใช้งาน"
          value={String(activeSubs.length)}
          hint={`฿${fmtMoney(subsMonthlyTHB)} / เดือน`}
          icon={<Repeat size={16} />}
          href="/app/subscriptions"
        />
        <StatCard
          label="ลูกค้าในระบบ"
          value={String(clients.length)}
          hint={clients.length > 0 ? "คลิกเพื่อดู CRM" : "เพิ่มลูกค้ารายแรก"}
          icon={<Users size={16} />}
          href="/app/clients"
        />
      </div>

      <PaymentStatus currency={sym} />

      <AiQuickCheck onOpen={() => setAiOpen(true)} />

      <PriceHistory onOpen={() => setAiOpen(true)} />

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <QuickFeatures clientCount={clients.length} />
        </div>
        <RecentActivity hasData={documents.length > 0} count={counts} />
      </div>

      <GoalModal
        open={goalOpen}
        year={year}
        month={month}
        currentAmount={goalAmount}
        currency={profile.currency}
        onClose={() => setGoalOpen(false)}
        onSaved={refresh}
      />

      <AiPriceCheckModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

function Greeting({ name }: { name: string }) {
  return (
    <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
      <div className="text-xs text-ink-400">
        สวัสดี <span className="inline-block">👋</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 mt-1 leading-tight">
        {name}
      </h1>
      <p className="text-sm text-ink-600 mt-1.5">
        นี่คือภาพรวมหลังบ้านของคุณวันนี้ — เลือกฟีเจอร์ที่ต้องการใช้ได้เลย
      </p>
    </section>
  );
}

function RevenueGoal({
  currency,
  amount,
  progress,
  income,
  onEdit,
}: {
  currency: string;
  amount: number;
  progress: number;
  income: number;
  onEdit: () => void;
}) {
  const goalSet = amount > 0;
  return (
    <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
          <Target size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-ink-400">เป้าหมายรายได้เดือนนี้</div>
          <div className="font-bold text-ink-900 text-lg leading-tight mt-0.5 tabular-nums">
            {currency}
            {fmtMoney(amount)}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-orange-200 text-xs font-medium text-ink-700 hover:bg-orange-50 transition"
        >
          <Pencil size={13} />
          {goalSet ? "แก้ไข" : "ตั้งเป้า"}
        </button>
      </div>
      {goalSet ? (
        <div className="mt-3">
          <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-ink-500 mt-1.5">
            <span>
              ทำได้ {currency}
              {fmtMoney(income)}
            </span>
            <span className="font-medium text-brand-700">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-ink-400 mt-3">
          ยังไม่ได้ตั้งเป้าหมายรายได้ — กดปุ่ม &ldquo;ตั้งเป้า&rdquo;
          เพื่อเริ่มติดตามความคืบหน้า
        </div>
      )}
    </section>
  );
}

function PaymentStatus({ currency }: { currency: string }) {
  return (
    <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-ink-800 font-semibold">
          <AlertTriangle size={16} className="text-brand-500" />
          สถานะการเก็บเงิน
        </div>
        <Link
          href="/app/finance"
          className="text-xs text-ink-400 hover:text-brand-600 transition"
        >
          ดูทั้งหมด
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <MiniPanel label="รวมรอเก็บ" value={`${currency}0`} tone="default" />
        <MiniPanel label="เกินกำหนด" value={`${currency}0`} tone="default" />
        <MiniPanel label="ได้รับแล้ว" value={`${currency}0`} tone="success" />
      </div>

      <div className="text-center text-xs text-green-600 mt-4 inline-flex items-center gap-1.5 w-full justify-center">
        <TrendingUp size={11} />
        ไม่มีใบแจ้งหนี้เกินกำหนด — เยี่ยมมาก!
      </div>
    </section>
  );
}

function MiniPanel({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "success";
}) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-4 py-3">
      <div className="text-[11px] text-ink-400">{label}</div>
      <div
        className={`text-lg font-bold mt-0.5 tabular-nums ${
          tone === "success" ? "text-green-600" : "text-ink-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function AiQuickCheck({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="bg-gradient-to-r from-peach-100 via-orange-50 to-white border border-orange-200/60 rounded-3xl shadow-soft p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center shadow-glow shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold text-ink-900 text-sm">
              AI Quick Price Check
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500 text-white">
              ใหม่
            </span>
          </div>
          <div className="text-xs text-ink-600 mt-0.5">
            ไม่แน่ใจราคา? ให้ So1o Mentor ช่วยประเมินใน 3 คำถาม — ดึงข้อมูลตลาดจริง
            + คิด WHT 3% ให้
          </div>
        </div>
        <button
          onClick={onOpen}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500 text-white text-xs font-medium transition shadow-soft"
        >
          <Sparkles size={12} />
          ประเมินราคา
        </button>
      </div>
      <button
        onClick={onOpen}
        className="sm:hidden mt-3 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 text-white text-xs font-medium transition"
      >
        <Sparkles size={12} />
        ประเมินราคา
      </button>
    </section>
  );
}

function PriceHistory({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-ink-800 font-semibold">
          <History size={16} className="text-brand-500" />
          ประวัติประเมินราคา
        </div>
        <button
          onClick={onOpen}
          className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 text-ink-700 hover:bg-orange-50 transition"
        >
          <Sparkles size={12} />
          ประเมินใหม่
        </button>
      </div>
      <div className="text-center text-xs text-ink-400 py-4">
        ยังไม่มีประวัติ — ลองกด &ldquo;ประเมินใหม่&rdquo; ดูครับ
      </div>
    </section>
  );
}

function QuickFeatures({ clientCount }: { clientCount: number }) {
  const FEATURES = [
    {
      icon: Wallet,
      label: "Finance & Tax",
      desc: "รายรับ-จ่าย, ภาษี, ใบเสนอราคา",
      href: "/app/finance",
    },
    {
      icon: Users,
      label: "Clients CRM",
      desc: `${clientCount} ลูกค้าในระบบ`,
      href: "/app/clients",
    },
    {
      icon: Repeat,
      label: "Subscriptions",
      desc: "บันทึก subscription รายเดือน-รายปี",
      href: "/app/subscriptions",
    },
    {
      icon: Briefcase,
      label: "Suppliers Hub",
      desc: "จดบันทึก supplier + ไฟล์ตัวอย่างงาน",
      href: "/app/suppliers",
    },
    {
      icon: UserCog,
      label: "ตั้งค่าโปรไฟล์",
      desc: "แบรนด์, การชำระเงิน",
      href: "/app/my-data",
    },
  ];

  return (
    <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
      <div className="font-semibold text-ink-900 mb-4">เข้าใช้งานฟีเจอร์</div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.href}
              href={f.href}
              className="flex items-center gap-3 p-3 rounded-2xl border border-orange-100 hover:border-brand-200 hover:bg-orange-50/50 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0 group-hover:bg-brand-500 group-hover:text-white transition">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate">
                  {f.label}
                </div>
                <div className="text-[11px] text-ink-400 truncate">
                  {f.desc}
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-ink-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RecentActivity({
  hasData,
  count,
}: {
  hasData: boolean;
  count: { invoices: number; receipts: number; quotes: number };
}) {
  return (
    <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
      <div className="flex items-center gap-2 text-ink-800 font-semibold mb-4">
        <Bell size={16} className="text-brand-500" />
        กิจกรรมล่าสุด
      </div>
      {hasData ? (
        <div className="space-y-2 text-xs text-ink-600">
          <ActivityRow
            label="ใบเสนอราคา"
            value={count.quotes}
            href="/app/finance"
          />
          <ActivityRow
            label="ใบแจ้งหนี้"
            value={count.invoices}
            href="/app/finance"
          />
          <ActivityRow
            label="ใบเสร็จรับเงิน"
            value={count.receipts}
            href="/app/finance"
          />
        </div>
      ) : (
        <div className="text-center text-xs text-ink-400 py-6">
          ยังไม่มีกิจกรรม — เริ่มสร้างเอกสารแรกได้ที่ Finance
        </div>
      )}
    </section>
  );
}

function ActivityRow({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/40 hover:bg-orange-50 transition"
    >
      <span className="text-ink-700">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-semibold text-ink-900 tabular-nums">{value}</span>
        <ArrowRight size={12} className="text-ink-300" />
      </span>
    </Link>
  );
}
