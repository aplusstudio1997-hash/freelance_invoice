"use client";

import { CheckCircle2, MessageSquare, Coffee, FileText, X } from "lucide-react";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
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
            บันทึก PDF สำเร็จ!
          </h3>
          <p className="text-sm text-gray-500">
            ถ้าถูกใจเครื่องมือนี้ ช่วยสนับสนุนหรือให้ข้อเสนอแนะได้เลย
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={onFeedback}
            className="flex flex-col items-center gap-1.5 border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-lg py-3 px-2 transition"
          >
            <MessageSquare size={20} className="text-brand-500" />
            <span className="text-xs font-medium text-gray-700">
              ข้อเสนอแนะ
            </span>
          </button>
          <button
            onClick={onDonate}
            className="flex flex-col items-center gap-1.5 border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-lg py-3 px-2 transition"
          >
            <Coffee size={20} className="text-brand-500" />
            <span className="text-xs font-medium text-gray-700">
              ช่วยค่ากาแฟ
            </span>
          </button>
          <button
            onClick={onViewPDF}
            className="flex flex-col items-center gap-1.5 border border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-lg py-3 px-2 transition"
          >
            <FileText size={20} className="text-brand-500" />
            <span className="text-xs font-medium text-gray-700">
              ดู PDF
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
