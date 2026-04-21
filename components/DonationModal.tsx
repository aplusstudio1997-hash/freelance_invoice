"use client";

import { Coffee, X, Heart } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DonationModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coffee size={20} className="text-brand-500" />
            <h3 className="font-semibold text-lg text-gray-800">
              สนับสนุนค่ากาแฟ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mb-4">
          ขอบคุณที่สนับสนุน!
        </p>

        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center mb-4">
          <div className="text-center text-gray-400">
            <div className="text-2xl font-medium mb-1">QR Code</div>
            <div className="text-xs">(ใส่ภาพ QR PromptPay ที่นี่)</div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-4 text-center">
          <div className="text-xs text-gray-500 mb-1">ชื่อบัญชี</div>
          <div className="text-brand-600 font-bold mb-3">PromptPay</div>
          <div className="text-xs text-gray-500 mb-1">เบอร์โทร</div>
          <div className="font-bold text-lg tracking-wider">0866259407</div>
        </div>

        <p className="text-xs text-gray-500 text-center mb-4 flex items-center justify-center gap-1">
          <Heart size={12} className="text-brand-500 fill-brand-500" />
          เงินสนับสนุนจะช่วยให้ฉันพัฒนาเครื่องมือนี้ได้ดีขึ้นต่อไป
        </p>

        <button
          onClick={onClose}
          className="w-full border border-brand-500 text-brand-600 hover:bg-brand-50 py-3 rounded-md font-medium transition"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}
