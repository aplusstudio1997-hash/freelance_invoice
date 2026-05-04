"use client";

import { useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { loadDraft, loadProfile, clearDraft } from "@/lib/storage";
import {
  createDocument,
  saveProfile as saveProfileRemote,
} from "@/lib/repository";
import { generateDocumentNumber } from "@/lib/types";

interface Props {
  onClose: () => void;
  onDone: () => void;
}

export default function MigrationModal({ onClose, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    setBusy(true);
    setError(null);
    try {
      const profile = loadProfile();
      await saveProfileRemote(profile);

      const draft = loadDraft();
      const number = draft.quoteNumber || generateDocumentNumber("quote");
      await createDocument({
        type: "quote",
        number,
        data: { ...draft, quoteNumber: number },
      });
      clearDraft();
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ";
      setError(msg);
      setBusy(false);
    }
  };

  const skip = () => {
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white sm:rounded-xl rounded-t-xl w-full sm:max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">นำเข้าข้อมูลเก่า</h3>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 shrink-0">
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-800">
                พบข้อมูลที่บันทึกไว้บนเครื่องนี้
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                คุณสามารถนำเข้าเป็นใบเสนอราคาใบแรกในบัญชีนี้ได้
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 leading-relaxed">
            ถ้าเลือก <span className="font-medium">นำเข้า</span> →
            ใบเสนอราคาเก่าจะถูกบันทึกเข้าบัญชี และข้อมูลในเครื่องจะถูกล้าง
            <br />
            ถ้าเลือก <span className="font-medium">ข้าม</span> →
            ข้อมูลในเครื่องจะคงไว้ แต่จะไม่ปรากฏในรายการเอกสารของบัญชี
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={skip}
            disabled={busy}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-md text-sm"
          >
            ข้าม
          </button>
          <button
            onClick={upload}
            disabled={busy}
            className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            นำเข้า
          </button>
        </div>
      </div>
    </div>
  );
}
