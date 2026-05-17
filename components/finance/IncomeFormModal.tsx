"use client";

import { useEffect, useState } from "react";
import {
  X,
  TrendingUp,
  Calendar,
  User,
  FileText,
  Tag,
  Loader2,
} from "lucide-react";
import {
  IncomeCategory,
  IncomeRecord,
  IncomeInput,
} from "@/lib/finance";
import { INCOME_CATEGORIES, fmtDateInput } from "@/lib/finance-utils";
import { useDocuments } from "@/lib/documents";
import { useModalDismiss } from "@/lib/useModalDismiss";
import FlatpickrInput from "@/components/FlatpickrInput";

interface Props {
  open: boolean;
  initial?: IncomeRecord | null;
  defaultClientId?: string | null;
  defaultDocumentId?: string | null;
  defaultDescription?: string;
  defaultAmount?: number;
  onClose: () => void;
  onSubmit: (data: IncomeInput) => Promise<void> | void;
}

const EMPTY: IncomeInput = {
  clientId: null,
  documentId: null,
  category: "service",
  description: "",
  amount: 0,
  currency: "THB",
  whtAmount: 0,
  vatAmount: 0,
  receivedAt: fmtDateInput(),
};

export default function IncomeFormModal({
  open,
  initial,
  defaultClientId,
  defaultDocumentId,
  defaultDescription,
  defaultAmount,
  onClose,
  onSubmit,
}: Props) {
  const { clients, documents } = useDocuments();
  const [form, setForm] = useState<IncomeInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onBackdropClick } = useModalDismiss(onClose, { open });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        clientId: initial.client_id,
        documentId: initial.document_id,
        category: initial.category,
        description: initial.description,
        amount: Number(initial.amount),
        currency: initial.currency,
        whtAmount: Number(initial.wht_amount),
        vatAmount: Number(initial.vat_amount),
        receivedAt: initial.received_at.slice(0, 10),
      });
    } else {
      setForm({
        ...EMPTY,
        clientId: defaultClientId ?? null,
        documentId: defaultDocumentId ?? null,
        description: defaultDescription || "",
        amount: defaultAmount || 0,
      });
    }
    setError(null);
  }, [
    open,
    initial,
    defaultClientId,
    defaultDocumentId,
    defaultDescription,
    defaultAmount,
  ]);

  if (!open) return null;

  const set = (patch: Partial<IncomeInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.description.trim()) {
      setError("กรุณากรอกรายละเอียดรายรับ");
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
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
            <h3 className="font-semibold text-ink-900">
              {initial ? "แก้ไขรายรับ" : "บันทึกรายรับ"}
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
            placeholder="เช่น งาน Logo Brand X, ค่าออกแบบเว็บ"
            required
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <NumberField
              label="จำนวนเงินรับสุทธิ (THB)"
              value={form.amount}
              onChange={(v) => set({ amount: v })}
              required
            />
            <FieldSelect
              label="หมวด"
              icon={<Tag size={13} />}
              value={form.category}
              onChange={(v) => set({ category: v as IncomeCategory })}
              options={Object.entries(INCOME_CATEGORIES).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <NumberField
              label="หัก ณ ที่จ่าย 3% (WHT)"
              value={form.whtAmount || 0}
              onChange={(v) => set({ whtAmount: v })}
              hint="ใส่ 0 ถ้าไม่ถูกหัก"
            />
            <NumberField
              label="VAT ที่เก็บได้"
              value={form.vatAmount || 0}
              onChange={(v) => set({ vatAmount: v })}
              hint="ใส่ 0 ถ้าไม่จด VAT"
            />
          </div>

          <FieldSelect
            label="ลูกค้า"
            icon={<User size={13} />}
            value={form.clientId || ""}
            onChange={(v) => set({ clientId: v || null })}
            options={[
              { value: "", label: "— ไม่ระบุ —" },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <FieldSelect
            label="ผูกกับเอกสาร (Invoice/Receipt)"
            icon={<FileText size={13} />}
            value={form.documentId || ""}
            onChange={(v) => set({ documentId: v || null })}
            options={[
              { value: "", label: "— ไม่ระบุ —" },
              ...documents
                .filter((d) => d.type === "invoice" || d.type === "receipt")
                .map((d) => ({
                  value: d.id,
                  label: `${d.number} — ${d.projectName || d.customerName || "—"}`,
                })),
            ]}
          />

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1.5">
              วันที่ได้รับ
            </label>
            <FlatpickrInput
              value={form.receivedAt}
              onChange={(v) => set({ receivedAt: v })}
            />
          </div>

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
            className="flex-1 py-2.5 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium transition flex items-center justify-center gap-2"
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
