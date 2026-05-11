"use client";

import { useEffect, useState, useMemo } from "react";
import {
  SubscriptionRecord,
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  monthlyEquivalent,
  yearlyEquivalent,
  daysUntil,
  nextBillingAfter,
} from "@/lib/subscriptions";
import { fmtMoney, fmtDateDisplay } from "@/lib/finance-utils";
import SubscriptionFormModal, {
  SUB_CATEGORIES,
  CYCLES,
} from "@/components/subscriptions/SubscriptionFormModal";
import {
  Repeat,
  Plus,
  Pencil,
  Trash2,
  Bell,
  Calendar,
  Power,
  PowerOff,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionRecord | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await listSubscriptions();
      setSubs(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return subs;
    return subs.filter((s) => (filter === "active" ? s.active : !s.active));
  }, [subs, filter]);

  const activeSubs = subs.filter((s) => s.active);

  const summary = useMemo(() => {
    const monthly = activeSubs.reduce(
      (acc, s) => {
        if (!acc[s.currency]) acc[s.currency] = 0;
        acc[s.currency] += monthlyEquivalent(s);
        return acc;
      },
      {} as Record<string, number>
    );
    const yearly = activeSubs.reduce(
      (acc, s) => {
        if (!acc[s.currency]) acc[s.currency] = 0;
        acc[s.currency] += yearlyEquivalent(s);
        return acc;
      },
      {} as Record<string, number>
    );
    return { monthly, yearly };
  }, [activeSubs]);

  const upcoming = useMemo(() => {
    return activeSubs
      .map((s) => ({ s, days: daysUntil(s.next_billing_at) }))
      .filter((x) => x.days !== null && x.days <= s_safe_notify(x.s))
      .sort((a, b) => (a.days || 0) - (b.days || 0));
  }, [activeSubs]);

  const onCreate = async (data: Parameters<typeof createSubscription>[0]) => {
    await createSubscription(data);
    await refresh();
  };

  const onUpdate = async (data: Parameters<typeof createSubscription>[0]) => {
    if (!editing) return;
    await updateSubscription(editing.id, data);
    setEditing(null);
    await refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("ลบ subscription นี้?")) return;
    await deleteSubscription(id);
    await refresh();
  };

  const toggleActive = async (s: SubscriptionRecord) => {
    await updateSubscription(s.id, { active: !s.active });
    await refresh();
  };

  const rollNext = async (s: SubscriptionRecord) => {
    if (!s.next_billing_at) return;
    const next = nextBillingAfter(s.next_billing_at, s.billing_cycle);
    await updateSubscription(s.id, { nextBillingAt: next });
    await refresh();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
            <Repeat size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink-900">
              Subscriptions Tracker
            </h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              ติดตาม subscription ทั้งหมด — แจ้งเตือนก่อนต่ออายุ
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition shadow-soft"
          >
            <Plus size={13} />
            เพิ่มใหม่
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <Stat
            label="ใช้งานอยู่"
            value={String(activeSubs.length)}
            hint={`จากทั้งหมด ${subs.length} รายการ`}
          />
          {Object.entries(summary.monthly).slice(0, 1).map(([cur, val]) => (
            <Stat
              key={cur}
              label="รวมต่อเดือน"
              value={`${cur === "THB" ? "฿" : cur + " "}${fmtMoney(val)}`}
              tone="primary"
            />
          ))}
          {Object.entries(summary.yearly).slice(0, 1).map(([cur, val]) => (
            <Stat
              key={cur + "_y"}
              label="รวมต่อปี"
              value={`${cur === "THB" ? "฿" : cur + " "}${fmtMoney(val)}`}
            />
          ))}
          <Stat
            label="ใกล้หมดอายุ"
            value={String(upcoming.length)}
            tone={upcoming.length > 0 ? "warn" : undefined}
          />
        </div>

        {Object.keys(summary.monthly).length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(summary.monthly).map(([cur, val]) => (
              <span
                key={cur}
                className="text-[11px] px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-700 font-medium tabular-nums"
              >
                {cur} {fmtMoney(val)}/เดือน
              </span>
            ))}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-amber-700 font-semibold mb-3">
            <Bell size={14} />
            ใกล้ต้องต่ออายุ
          </div>
          <div className="space-y-1.5">
            {upcoming.slice(0, 5).map(({ s, days }) => (
              <div
                key={s.id}
                className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 border border-amber-100"
              >
                <Calendar size={13} className="text-amber-600 shrink-0" />
                <span className="text-sm font-medium text-ink-900 truncate flex-1">
                  {s.name}
                </span>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    (days || 0) <= 0
                      ? "text-red-600"
                      : (days || 0) <= 3
                        ? "text-amber-600"
                        : "text-ink-500"
                  }`}
                >
                  {(days || 0) <= 0
                    ? "ครบกำหนดแล้ว"
                    : `อีก ${days} วัน`}
                </span>
                <span className="text-[11px] text-ink-400 tabular-nums hidden sm:inline">
                  {s.currency === "THB" ? "฿" : `${s.currency} `}
                  {fmtMoney(Number(s.amount))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-orange-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-ink-400 mr-1">แสดง</span>
          <div className="inline-flex items-center bg-orange-50/40 border border-orange-100 rounded-full p-1 gap-0.5">
            {(["active", "all", "inactive"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                  filter === k
                    ? "bg-ink-900 text-white"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {k === "active"
                  ? "ใช้งานอยู่"
                  : k === "inactive"
                    ? "หยุดใช้งาน"
                    : "ทั้งหมด"}
              </button>
            ))}
          </div>
          <span className="text-xs text-ink-400 ml-auto">
            {filtered.length} รายการ
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">
            <Loader2 size={14} className="animate-spin mr-2" />
            กำลังโหลด...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Repeat size={22} />
            </div>
            <div className="text-sm font-medium text-ink-700">
              {filter === "all"
                ? "ยังไม่มี subscription ในระบบ"
                : filter === "active"
                  ? "ไม่มี subscription ที่ใช้งานอยู่"
                  : "ไม่มี subscription ที่หยุดใช้งาน"}
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition shadow-soft"
            >
              <Plus size={12} />
              เพิ่ม Subscription
            </button>
          </div>
        ) : (
          <div className="divide-y divide-orange-100">
            {filtered.map((s) => {
              const days = daysUntil(s.next_billing_at);
              const due =
                days !== null && days <= s.notify_days && s.active;
              const monthly = monthlyEquivalent(s);
              return (
                <div
                  key={s.id}
                  className={`px-4 sm:px-5 py-3 hover:bg-orange-50/30 transition group ${
                    !s.active ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        s.active
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-ink-100 text-ink-400"
                      }`}
                    >
                      <Repeat size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-ink-900 truncate">
                          {s.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                          {SUB_CATEGORIES[s.category]}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-brand-700 border border-orange-100 font-medium">
                          {CYCLES[s.billing_cycle]}
                        </span>
                        {!s.active && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-500 font-medium">
                            หยุดใช้งาน
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-ink-400 mt-0.5 flex-wrap">
                        {s.next_billing_at && (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              due && (days || 0) <= 0
                                ? "text-red-600 font-medium"
                                : due
                                  ? "text-amber-600 font-medium"
                                  : ""
                            }`}
                          >
                            <Calendar size={9} />
                            ต่ออายุ {fmtDateDisplay(s.next_billing_at)}
                            {days !== null && (
                              <span>
                                {" "}
                                ({(days || 0) <= 0
                                  ? "ครบแล้ว"
                                  : `อีก ${days} วัน`})
                              </span>
                            )}
                          </span>
                        )}
                        {s.notify_days > 0 && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Bell size={9} />
                              เตือนก่อน {s.notify_days} วัน
                            </span>
                          </>
                        )}
                      </div>
                      {s.note && (
                        <div className="text-[11px] text-ink-500 mt-1 italic truncate">
                          {s.note}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-ink-900 tabular-nums">
                        {s.currency === "THB" ? "฿" : `${s.currency} `}
                        {fmtMoney(Number(s.amount))}
                      </div>
                      <div className="text-[10px] text-ink-400 tabular-nums">
                        ≈ ฿{fmtMoney(monthly)}/เดือน
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      {s.next_billing_at && s.active && (
                        <button
                          onClick={() => rollNext(s)}
                          className="p-1.5 rounded-full hover:bg-orange-50 text-ink-400 hover:text-brand-600"
                          aria-label="เลื่อนเป็นรอบถัดไป"
                          title="เลื่อนเป็นรอบถัดไป (ต่ออายุแล้ว)"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive(s)}
                        className="p-1.5 rounded-full hover:bg-orange-50 text-ink-400 hover:text-ink-700"
                        aria-label="toggle"
                        title={s.active ? "หยุดใช้งาน" : "เปิดใช้งาน"}
                      >
                        {s.active ? (
                          <PowerOff size={13} />
                        ) : (
                          <Power size={13} />
                        )}
                      </button>
                      <button
                        onClick={() => setEditing(s)}
                        className="p-1.5 rounded-full hover:bg-orange-50 text-ink-400 hover:text-brand-600"
                        aria-label="แก้ไข"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-ink-400 hover:text-red-600"
                        aria-label="ลบ"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <SubscriptionFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={onCreate}
      />
      <SubscriptionFormModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={onUpdate}
      />
    </div>
  );
}

function s_safe_notify(s: SubscriptionRecord): number {
  return Math.max(s.notify_days || 0, 0);
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "warn";
}) {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-3 py-2.5">
      <div className="text-[10px] text-ink-400 uppercase tracking-wide truncate">
        {label}
      </div>
      <div
        className={`text-base font-bold mt-0.5 tabular-nums truncate ${
          tone === "primary"
            ? "text-indigo-600"
            : tone === "warn"
              ? "text-amber-600"
              : "text-ink-900"
        }`}
      >
        {value}
      </div>
      {hint && <div className="text-[10px] text-ink-400 mt-0.5">{hint}</div>}
    </div>
  );
}
