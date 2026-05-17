"use client";

import { useEffect, useState } from "react";
import {
  X,
  TrendingDown,
  Calendar,
  Tag,
  FileText,
  Store,
  Loader2,
} from "lucide-react";
import {
  ExpenseCategory,
  ExpenseRecord,
  ExpenseInput,
} from "@/lib/finance";
import { EXPENSE_CATEGORIES, fmtDateInput } from "@/lib/finance-utils";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  open: boolean;
  initial?: ExpenseRecord | null;
  onClose: () => void;
  onSubmit: (data: ExpenseInput) => Promise<void> | void;
}

const EMPTY: ExpenseInput = {
  category: "other",
  description: "",
  amount: 0,
  currency: "THB",
  vatAmount: 0,
  vendor: "",
  paidAt: fmtDateInput(),
};

export default function ExpenseFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ExpenseInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onBackdropClick } = useModalDismiss(onClose, { open });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        category: initial.category,
        description: initial.description,
        amount: Number(initial.amount),
        currency: initial.currency,
        vatAmount: Number(initial.vat_amount),
        vendor: initial.vendor,
        paidAt: initial.paid_at.slice(0, 10),
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const set = (patch: Partial<ExpenseInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.description.trim()) {
      setError("กรุณากรอกรายละเอียดรายจ่าย");
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
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-lg shadow-soft-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown size={15} />
            </div>
            <h3 className="font-semibold text-ink-900">
              {initial ? "แก้ไขรายจ่าย" : "บันทึกรายจ่าย"}
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
            label="รายละเอียด"
            icon={<FileText size={13} />}
            value={form.description}
            onChange={(v) => set({ description: v })}
            placeholder="เช่น Adobe CC, ค่าเช่า co-working"
            required
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <NumberField
              label="จำนวนเงิน (THB)"
              value={form.amount}
              onChange={(v) => set({ amount: v })}
              required
            />
            <NumberField
              label="VAT ที่จ่าย"
              value={form.vatAmount || 0}
              onChange={(v) => set({ vatAmount: v })}
              hint="ใส่ 0 ถ้าไม่มีใบกำกับ"
            />
          </div>

          <FieldSelect
            label="หมวด"
            icon={<Tag size={13} />}
            value={form.category}
            onChange={(v) => set({ category: v as ExpenseCategory })}
            options={Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
          />

          <Field
            label="ร้านค้า / ผู้ให้บริการ"
            icon={<Store size={13} />}
            value={form.vendor || ""}
            onChange={(v) => set({ vendor: v })}
            placeholder="ไม่บังคับ"
          />

          <Field
            label="วันที่จ่าย"
            icon={<Calendar size={13} />}
            type="date"
            value={form.paidAt}
            onChange={(v) => set({ paidAt: v })}
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
            className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-sm font-medium transition flex items-center justify-center gap-2"
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
  value,
  onChange,
  hint,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  required?: boolean;
}) {
  const [str, setStr] = useState(value ? String(value) : "");
  useEffect(() => {
    setStr((prev) => {
      const parsed = parseFloat(prev);
      if (Number.isFinite(parsed) && parsed === value) return prev;
      return value ? String(value) : "";
    });
  }, [value]);

  return (
    <div>
      <label className="block text-xs font-medium text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-brand-500 ml-1">*</span>}
      </label>
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
        className="w-full px-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition tabular-nums"
      />
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
