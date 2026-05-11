"use client";

import { useEffect, useState } from "react";
import {
  X,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Tag,
  StickyNote,
  Loader2,
  Wrench,
} from "lucide-react";
import {
  SupplierCategory,
  SupplierRecord,
  SupplierInput,
} from "@/lib/suppliers";

export const SUPPLIER_CATEGORIES: Record<SupplierCategory, string> = {
  photographer: "ช่างภาพ",
  videographer: "ช่างวิดีโอ",
  designer: "นักออกแบบ",
  developer: "นักพัฒนา",
  printer: "ร้านพิมพ์",
  studio: "สตูดิโอ",
  model: "นายแบบ/นางแบบ",
  voice_actor: "นักพากย์",
  translator: "นักแปล",
  writer: "นักเขียน",
  marketer: "นักการตลาด",
  logistics: "ขนส่ง",
  other: "อื่น ๆ",
};

interface Props {
  open: boolean;
  initial?: SupplierRecord | null;
  onClose: () => void;
  onSubmit: (data: SupplierInput) => Promise<void> | void;
}

const EMPTY: SupplierInput = {
  name: "",
  category: "other",
  phone: "",
  email: "",
  address: "",
  serviceType: "",
  note: "",
};

export default function SupplierFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<SupplierInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category,
        phone: initial.phone,
        email: initial.email,
        address: initial.address,
        serviceType: initial.service_type,
        note: initial.note,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const set = (patch: Partial<SupplierInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อ supplier");
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
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase size={15} />
            </div>
            <h3 className="font-semibold text-ink-900">
              {initial ? "แก้ไข Supplier" : "เพิ่ม Supplier"}
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
            label="ชื่อ Supplier"
            value={form.name}
            onChange={(v) => set({ name: v })}
            placeholder="ชื่อบุคคลหรือบริษัท"
            required
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <FieldSelect
              label="หมวด"
              icon={<Tag size={13} />}
              value={form.category}
              onChange={(v) => set({ category: v as SupplierCategory })}
              options={Object.entries(SUPPLIER_CATEGORIES).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
            <Field
              label="ประเภทบริการ"
              icon={<Wrench size={13} />}
              value={form.serviceType || ""}
              onChange={(v) => set({ serviceType: v })}
              placeholder="เช่น Wedding, Product"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="อีเมล"
              icon={<Mail size={13} />}
              type="email"
              value={form.email || ""}
              onChange={(v) => set({ email: v })}
            />
            <Field
              label="โทรศัพท์"
              icon={<Phone size={13} />}
              value={form.phone || ""}
              onChange={(v) => set({ phone: v })}
            />
          </div>

          <Textarea
            label="ที่อยู่"
            icon={<MapPin size={13} />}
            value={form.address || ""}
            onChange={(v) => set({ address: v })}
            rows={2}
          />

          <Textarea
            label="หมายเหตุ"
            icon={<StickyNote size={13} />}
            value={form.note || ""}
            onChange={(v) => set({ note: v })}
            rows={3}
            placeholder="ราคา ความเชี่ยวชาญ ข้อตกลงที่เคยทำงานด้วย"
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
            className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-medium transition flex items-center justify-center gap-2"
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
