"use client";

import { CheckCircle2, MessageSquare, Coffee, Download, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  open: boolean;
  onClose: () => void;
  onFeedback: () => void;
  onDonate: () => void;
  onViewPDF: () => void;
}

export default function SuccessModal({
  open,
  onClose,
  onFeedback,
  onDonate,
  onViewPDF,
}: Props) {
  const { onBackdropClick } = useModalDismiss(onClose, { open });
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
          aria-label="ปิด"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <CheckCircle2 size={36} className="text-green-600" strokeWidth={2.5} />
          </div>
          <h3 className="font-semibold text-lg text-gray-800 mb-1">
            เตรียมไฟล์เสร็จสิ้น
          </h3>
          <p className="text-sm text-gray-500">
            กดปุ่มด้านล่างเพื่อดาวน์โหลด PDF
          </p>
        </div>

        <button
          onClick={onViewPDF}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold py-3 rounded-lg transition mb-3"
        >
          <Download size={18} />
          ดาวน์โหลด PDF
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onFeedback}
            className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-lg py-2.5 px-2 transition"
          >
            <MessageSquare size={14} className="text-brand-500" />
            <span className="text-xs font-medium text-gray-700">
              ข้อเสนอแนะ
            </span>
          </button>
          <button
            onClick={onDonate}
            className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-lg py-2.5 px-2 transition"
          >
            <Coffee size={14} className="text-brand-500" />
            <span className="text-xs font-medium text-gray-700">
              ช่วยค่ากาแฟ
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
