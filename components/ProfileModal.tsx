"use client";

import { Profile, CURRENCIES, DEFAULT_PROFILE } from "@/lib/types";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (p: Profile) => void;
}

const MAX_LOGO_SIZE = 500 * 1024;

export default function ProfileModal({
  open,
  profile,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<Profile>(profile);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setForm(profile);
  }, [open, profile]);

  if (!open) return null;

  const set = (patch: Partial<Profile>) => setForm((f) => ({ ...f, ...patch }));

  const handleLogoPick = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_LOGO_SIZE) {
      alert(`ขนาดไฟล์ต้องไม่เกิน ${Math.round(MAX_LOGO_SIZE / 1024)}KB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set({ logo: String(reader.result || "") });
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    onSave(form);
    onClose();
  };

  const reset = () => {
    if (confirm("รีเซ็ตเป็นค่าตั้งต้น?")) setForm(DEFAULT_PROFILE);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-none sm:rounded-xl max-w-md w-full shadow-xl animate-fadeIn flex flex-col max-h-[100dvh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800">ตั้งค่าส่วนตัว</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-3 text-sm">
          <Field label="ชื่อร้าน/สตูดิโอ">
            <input
              value={form.studioName}
              onChange={(e) => set({ studioName: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="แท็กไลน์">
            <input
              value={form.tagline}
              onChange={(e) => set({ tagline: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="ชื่อของคุณ">
            <input
              value={form.ownerName}
              onChange={(e) => set({ ownerName: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="เบอร์โทร">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="เช่น 081-234-5678"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="EMAIL">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="เช่น hello@freelance.com"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="ที่อยู่">
            <input
              value={form.address}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="เช่น Bangkok, Thailand"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="เลขประชาชน/นิติบุคคล">
            <input
              value={form.taxId}
              onChange={(e) => set({ taxId: e.target.value })}
              placeholder="เช่น 1234567890123"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="สกุลเงิน">
            <select
              value={form.currency}
              onChange={(e) => set({ currency: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="เงื่อนไขการใช้บริการ">
            <textarea
              value={form.terms}
              onChange={(e) => set({ terms: e.target.value })}
              rows={4}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
              placeholder="ข้อละ 1 บรรทัด"
            />
            <p className="text-xs text-gray-400 mt-1">
              แต่ละบรรทัดจะเป็น bullet ในใบเสนอราคา
            </p>
          </Field>

          <Field label="โลโก้ร้าน">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {form.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.logo}
                    alt="logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">โลโก้</span>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2.5 hover:bg-gray-50 text-gray-700 text-sm"
                >
                  เลือกรูป
                </button>
                {form.logo && (
                  <button
                    onClick={() => set({ logo: "" })}
                    className="px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-md text-sm"
                  >
                    ลบ
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoPick(e.target.files?.[0] || null)}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              รูปสี่เหลี่ยมจัตุรัสสวยที่สุด · ไม่เกิน 500KB
            </p>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-2 safe-bottom">
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 px-3"
          >
            รีเซ็ต
          </button>
          <button
            onClick={save}
            className="flex-1 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-3 rounded-md font-medium transition"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
