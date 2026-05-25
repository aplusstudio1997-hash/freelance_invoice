"use client";

import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  StickyNote,
  Loader2,
} from "lucide-react";
import { ClientRecord } from "@/lib/repository";
import { useModalDismiss } from "@/lib/useModalDismiss";

export interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
  taxId: string;
  note: string;
}

const EMPTY: ClientFormData = {
  name: "",
  phone: "",
  email: "",
  lineId: "",
  address: "",
  taxId: "",
  note: "",
};

interface Props {
  open: boolean;
  initial?: ClientRecord | null;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void> | void;
}

export default function ClientFormModal({
  open,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ClientFormData>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onBackdropClick } = useModalDismiss(onClose, { open });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        phone: initial.phone,
        email: initial.email,
        lineId: initial.line_id,
        address: initial.address,
        taxId: initial.tax_id,
        note: initial.note,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const set = (patch: Partial<ClientFormData>) =>
    setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อลูกค้า");
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
          <h3 className="font-semibold text-ink-900">
            {initial ? "แก้ไขลูกค้า" : "เพิ่มลูกค้าใหม่"}
          </h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 px-5 py-4 overflow-y-auto space-y-3.5 scrollbar-thin">
          <FormField
            label="ชื่อลูกค้า / บริษัท"
            icon={<User size={13} />}
            value={form.name}
            onChange={(v) => set({ name: v })}
            required
            placeholder="ชื่อ-นามสกุล หรือชื่อบริษัท"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField
              label="อีเมล"
              icon={<Mail size={13} />}
              value={form.email}
              onChange={(v) => set({ email: v })}
              type="email"
              placeholder="example@email.com"
            />
            <FormField
              label="โทรศัพท์"
              icon={<Phone size={13} />}
              value={form.phone}
              onChange={(v) => set({ phone: v })}
              placeholder="08x-xxx-xxxx"
            />
          </div>
          <FormField
            label="LINE ID"
            icon={<User size={13} />}
            value={form.lineId}
            onChange={(v) => set({ lineId: v })}
            placeholder="ไม่บังคับ"
          />
          <FormTextarea
            label="ที่อยู่"
            icon={<MapPin size={13} />}
            value={form.address}
            onChange={(v) => set({ address: v })}
            rows={2}
            placeholder="ที่อยู่สำหรับออกใบกำกับภาษี"
          />
          <FormField
            label="เลขประจำตัวผู้เสียภาษี"
            icon={<FileText size={13} />}
            value={form.taxId}
            onChange={(v) => set({ taxId: v })}
            placeholder="13 หลัก (ไม่บังคับ)"
          />
          <FormTextarea
            label="หมายเหตุ"
            icon={<StickyNote size={13} />}
            value={form.note}
            onChange={(v) => set({ note: v })}
            rows={2}
            placeholder="โน้ตเพิ่มเติมเกี่ยวกับลูกค้า"
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
            className="flex-1 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 disabled:bg-ink-400 text-white text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
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
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
        />
      </div>
    </div>
  );
}

function FormTextarea({
  label,
  icon,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
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
        <span className="absolute left-3.5 top-3 text-ink-400">{icon}</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full pl-10 pr-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition resize-none"
        />
      </div>
    </div>
  );
}
