"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  current: number;
  onClose: () => void;
  onSave: (n: number) => void;
}

export default function BillableRevisionModal({
  open,
  current,
  onClose,
  onSave,
}: Props) {
  const [value, setValue] = useState(String(current));

  useEffect(() => {
    if (open) setValue(String(current));
  }, [open, current]);

  if (!open) return null;

  const save = () => {
    const n = Math.max(1, Math.floor(Number(value) || 1));
    onSave(n);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full p-6 animate-fadeIn shadow-xl"
              >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            ตั้งค่ารอบคิดเงิน
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          ตั้งแต่รอบแก้ไขที่เท่าไหร่เป็นต้นไป จึงจะเริ่มคิดค่าแก้ไขเพิ่ม?
        </p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">ตั้งแต่รอบที่</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-20 border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 text-center font-semibold"
          />
          <span className="text-sm text-gray-600">เป็นต้นไป</span>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          ค่าเริ่มต้น: 4 · หมายความว่า 3 รอบแรกฟรี รอบที่ 4+ จะคิดเพิ่ม
        </p>

        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex-1 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-2.5 rounded-md font-medium transition"
          >
            บันทึก
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
