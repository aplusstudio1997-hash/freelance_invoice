"use client";

import {
  Profile,
  CURRENCIES,
  DEFAULT_PROFILE,
  PaymentInfo,
} from "@/lib/types";
import { X, Image as ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (p: Profile) => void;
}

const MAX_IMAGE_SIZE = 500 * 1024;

export default function ProfileModal({
  open,
  profile,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<Profile>(profile);
  const logoRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setForm(profile);
  }, [open, profile]);

  if (!open) return null;

  const set = (patch: Partial<Profile>) => setForm((f) => ({ ...f, ...patch }));
  const setPayment = (patch: Partial<PaymentInfo>) =>
    setForm((f) => ({ ...f, payment: { ...f.payment, ...patch } }));

  const pickImage = (file: File | null, field: "logo" | "qr") => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      alert(`ขนาดไฟล์ต้องไม่เกิน ${Math.round(MAX_IMAGE_SIZE / 1024)}KB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (field === "logo") set({ logo: dataUrl });
      else setPayment({ qrCode: dataUrl });
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
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center px-3 pt-3 pb-8 sm:px-4 sm:pt-4 sm:pb-8"
    >
      <div
        className="bg-white rounded-xl max-w-md w-full shadow-xl animate-fadeIn flex flex-col max-h-full"
              >
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-800">ตั้งค่าส่วนตัว</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="ปิด"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ตั้งค่าส่วนตัวเพื่อใช้เป็นข้อมูลในการทำใบเสนอราคา
          </p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4 text-sm">
          <section>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              โลโก้ร้าน
            </label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {form.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.logo}
                    alt="logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon size={22} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => logoRef.current?.click()}
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
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0] || null, "logo")}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              รูปสี่เหลี่ยมจัตุรัสสวยที่สุด · ไม่เกิน 500KB
            </p>
          </section>

          <Divider />

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
            <textarea
              value={form.address}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="เช่น 123/4 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110"
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
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

          <Divider label="ช่องทางการชำระเงิน" />

          <Field label="ชื่อธนาคาร">
            <input
              value={form.payment.bankName}
              onChange={(e) => setPayment({ bankName: e.target.value })}
              placeholder="เช่น กสิกรไทย, PromptPay"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="ชื่อบัญชี">
            <input
              value={form.payment.accountName}
              onChange={(e) => setPayment({ accountName: e.target.value })}
              placeholder="เช่น สมชาย ใจดี"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="เลขบัญชี">
            <input
              value={form.payment.accountNumber}
              onChange={(e) => setPayment({ accountNumber: e.target.value })}
              placeholder="เช่น 123-4-56789-0"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>

          <Field label="QR Code สำหรับชำระเงิน">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {form.payment.qrCode ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.payment.qrCode}
                    alt="QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon size={22} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => qrRef.current?.click()}
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2.5 hover:bg-gray-50 text-gray-700 text-sm"
                >
                  อัปโหลด QR
                </button>
                {form.payment.qrCode && (
                  <button
                    onClick={() => setPayment({ qrCode: "" })}
                    className="px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-md text-sm"
                  >
                    ลบ
                  </button>
                )}
              </div>
              <input
                ref={qrRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0] || null, "qr")}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              จะปรากฏในใบเสนอราคา · ไม่เกิน 500KB
            </p>
          </Field>

          <Divider />

          <Field label="Social / Portfolio (ลิงก์เดียว)">
            <input
              type="url"
              value={form.socialLink}
              onChange={(e) => set({ socialLink: e.target.value })}
              placeholder="เช่น https://instagram.com/your_handle"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
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
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white flex items-center gap-3 safe-bottom rounded-b-xl">
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-md transition shrink-0"
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

function Divider({ label }: { label?: string }) {
  if (!label)
    return <div className="border-t border-gray-100 my-2" />;
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="h-px bg-gray-200 flex-1" />
      <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </span>
      <div className="h-px bg-gray-200 flex-1" />
    </div>
  );
}
