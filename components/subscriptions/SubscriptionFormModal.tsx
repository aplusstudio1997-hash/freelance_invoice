"use client";

import { useEffect, useState } from "react";
import {
  X,
  Repeat,
  Calendar,
  Tag,
  StickyNote,
  Loader2,
  Bell,
} from "lucide-react";
import {
  BillingCycle,
  SubCategory,
  SubscriptionRecord,
  SubscriptionInput,
} from "@/lib/subscriptions";
import { fmtDateInput } from "@/lib/finance-utils";
import { CURRENCIES } from "@/lib/types";

const SUB_CATEGORIES: Record<SubCategory, string> = {
  software: "ซอฟต์แวร์",
  hosting: "Hosting / Server",
  domain: "Domain",
  design_tool: "เครื่องมือออกแบบ",
  ai_tool: "AI Tool",
  stock_asset: "Stock / Asset",
  music: "เพลง / เสียง",
  video: "วิดีโอ / สตรีม",
  communication: "Communication",
  marketing: "Marketing",
  storage: "Storage / Cloud",
  other: "อื่น ๆ",
};

const CYCLES: Record<BillingCycle, string> = {
  weekly: "รายสัปดาห์",
  monthly: "รายเดือน",
  quarterly: "รายไตรมาส",
  yearly: "รายปี",
};

interface Props {
  open: boolean;
  initial?: SubscriptionRecord | null;
  onClose: () => void;
  onSubmit: (data: SubscriptionInput) => Promise<void> | void;
}

const EMPTY: SubscriptionInput = {
  name: "",
  category: "software",
  amount: 0,
  currency: "THB",
  billingCycle: "monthly",
  nextBillingAt: fmtDateInput(),
  active: true,
  notifyDays: 3,
  note: "",
};

export default function SubscriptionFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<SubscriptionInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category,
        amount: Number(initial.amount),
        currency: initial.currency,
        billingCycle: initial.billing_cycle,
        nextBillingAt: initial.next_billing_at,
        active: initial.active,
        notifyDays: initial.notify_days,
        note: initial.note,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const set = (patch: Partial<SubscriptionInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อ subscription");
      return;
    }
    if (!Number.isFinite(form.amount) || form.amount <= 0) {
      setError("จำนวนเงินต้องมากกว่า 0");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-lg shadow-soft-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat size={15} />
            </div>
            <h3 className="font-semibold text-ink-900">
              {initial ? "แก้ไข Subscription" : "เพิ่ม Subscription"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto space-y-3.5 scrollbar-thin">
          <Field
            label="ชื่อ Subscription"
            value={form.name}
            onChange={(v) => set({ name: v })}
            placeholder="เช่น Adobe Creative Cloud, Figma Pro"
            required
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <NumberField
              label="จำนวนเงิน"
              value={form.amount}
              onChange={(v) => set({ amount: v })}
              required
            />
            <FieldSelect
              label="สกุลเงิน"
              value={form.currency}
              onChange={(v) => set({ currency: v })}
              options={CURRENCIES.map((c) => ({
                value: c.code,
                label: `${c.code} (${c.symbol}) ${c.label}`,
              }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <FieldSelect
              label="รอบบิล"
              icon={<Repeat size={13} />}
              value={form.billingCycle}
              onChange={(v) => set({ billingCycle: v as BillingCycle })}
              options={Object.entries(CYCLES).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
            <FieldSelect
              label="หมวด"
              icon={<Tag size={13} />}
              value={form.category}
              onChange={(v) => set({ category: v as SubCategory })}
              options={Object.entries(SUB_CATEGORIES).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
          </div>

          <Field
            label="วันต่ออายุถัดไป"
            icon={<Calendar size={13} />}
            type="date"
            value={form.nextBillingAt || ""}
            onChange={(v) => set({ nextBillingAt: v || null })}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <NumberField
              label="แจ้งเตือนล่วงหน้า (วัน)"
              value={form.notifyDays}
              onChange={(v) => set({ notifyDays: Math.max(0, Math.floor(v)) })}
              icon={<Bell size={13} />}
              hint="0 = ไม่แจ้งเตือน"
            />
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">
                สถานะ
              </label>
              <div className="flex items-center gap-2 bg-orange-50/40 border border-orange-100 rounded-2xl px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => set({ active: !form.active })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    form.active ? "bg-green-500" : "bg-ink-200"
                  }`}
                  aria-label="toggle active"
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                      form.active ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-ink-700 font-medium">
                  {form.active ? "ใช้งานอยู่" : "หยุดใช้งาน"}
                </span>
              </div>
            </div>
          </div>

          <Textarea
            label="หมายเหตุ"
            icon={<StickyNote size={13} />}
            value={form.note || ""}
            onChange={(v) => set({ note: v })}
            rows={2}
            placeholder="โน้ตเพิ่มเติม เช่น แอคเคาท์ที่ใช้, plan ไหน"
          />

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-orange-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-orange-200 text-ink-700 hover:bg-orange-50 text-sm font-medium transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  icon?: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-brand-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition`}
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  icon,
  value,
  onChange,
  hint,
  required,
}: {
  label: string;
  icon?: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  required?: boolean;
}) {
  const [str, setStr] = useState(value ? String(value) : "");
  useEffect(() => {
    setStr(value ? String(value) : "");
  }, [value]);
  return (
    <div>
      <label className="block text-xs font-medium text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-brand-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={str}
          onChange={(e) => {
            setStr(e.target.value);
            const n = parseFloat(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition tabular-nums`}
        />
      </div>
      {hint && <div className="text-xs text-ink-400 mt-1">{hint}</div>}
    </div>
  );
}

function FieldSelect({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition appearance-none`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Textarea({
  label,
  icon,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-3 text-ink-400">{icon}</span>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition resize-none`}
        />
      </div>
    </div>
  );
}

export { SUB_CATEGORIES, CYCLES };
