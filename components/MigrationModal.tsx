"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud, X, Check } from "lucide-react";
import { loadDraft, loadProfile, clearDraft } from "@/lib/storage";
import { useModalDismiss } from "@/lib/useModalDismiss";
import {
  createDocument,
  createClient,
  saveProfile as saveProfileRemote,
  findClientByName,
  migrateEmbeddedCustomersToClients,
} from "@/lib/repository";
import { generateDocumentNumber } from "@/lib/types";

interface Props {
  onClose: () => void;
  onDone: () => void;
}

export default function MigrationModal({ onClose, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>("");
  const { onBackdropClick } = useModalDismiss(onClose, { open: !busy });
  // mount flag so async setState calls don't fire after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const safeSet = <T,>(setter: (v: T) => void, value: T) => {
    if (mountedRef.current) setter(value);
  };

  const upload = async () => {
    setBusy(true);
    setError(null);
    try {
      safeSet(setStep, "กำลังบันทึกโปรไฟล์...");
      const profile = loadProfile();
      await saveProfileRemote(profile);

      safeSet(setStep, "กำลังบันทึกเอกสาร...");
      const draft = loadDraft();
      const number = draft.quoteNumber || generateDocumentNumber("quote");

      let clientId: string | null = null;
      if (draft.customer?.name?.trim()) {
        safeSet(setStep, "กำลังบันทึกลูกค้า...");
        const existing = await findClientByName(draft.customer.name);
        if (existing) {
          clientId = existing.id;
        } else {
          const created = await createClient(draft.customer);
          clientId = created.id;
        }
      }

      await createDocument({
        type: "quote",
        number,
        data: { ...draft, quoteNumber: number },
        clientId,
      });

      safeSet(setStep, "กำลังจัดระเบียบเอกสารเดิม...");
      await migrateEmbeddedCustomersToClients();

      clearDraft();
      if (mountedRef.current) onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ";
      safeSet(setError, msg);
    } finally {
      // always reset busy so the user can retry after an error and the button
      // doesn't stay disabled forever if onDone doesn't unmount
      safeSet(setBusy, false);
    }
  };

  const skip = () => onDone();

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-md shadow-soft-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
          <h3 className="font-semibold text-ink-900">นำเข้าข้อมูลเก่า</h3>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50 disabled:opacity-50"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-brand-500 shrink-0">
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="font-medium text-ink-900">
                พบข้อมูลที่บันทึกไว้บนเครื่องนี้
              </p>
              <p className="text-xs text-ink-400 mt-0.5">
                ระบบจะย้ายข้อมูลเหล่านี้เข้าบัญชีของคุณ
              </p>
            </div>
          </div>

          <ul className="text-xs text-ink-600 space-y-1.5 bg-orange-50/40 border border-orange-100 rounded-2xl p-3">
            <ListItem>โปรไฟล์แบรนด์ + ข้อมูลการชำระเงิน</ListItem>
            <ListItem>ใบเสนอราคา (ดราฟต์) เป็นเอกสารใบแรก</ListItem>
            <ListItem>ลูกค้าจากดราฟต์ เข้าระบบ Clients CRM</ListItem>
            <ListItem>เอกสารเก่าทุกใบจะถูกผูกกับลูกค้าอัตโนมัติ</ListItem>
          </ul>

          {step && busy && (
            <div className="text-xs text-brand-700 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              {step}
            </div>
          )}

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-orange-100">
          <button
            onClick={skip}
            disabled={busy}
            className="flex-1 border border-orange-200 hover:bg-orange-50 text-ink-700 py-2.5 rounded-full text-sm font-medium transition disabled:opacity-50"
          >
            ข้าม
          </button>
          <button
            onClick={upload}
            disabled={busy}
            className="flex-1 bg-ink-900 hover:bg-ink-800 disabled:bg-ink-400 text-white py-2.5 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition shadow-soft"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            นำเข้าข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check size={11} className="text-brand-500 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
