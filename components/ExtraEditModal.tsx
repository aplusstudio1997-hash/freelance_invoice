"use client";

import { ExtraOption } from "@/lib/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  extra: ExtraOption | null;
  onClose: () => void;
  onSave: (x: ExtraOption) => void;
  onDelete?: (id: string) => void;
}

export default function ExtraEditModal({
  open,
  extra,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [label, setLabel] = useState("");
  const [percent, setPercent] = useState("0");

  useEffect(() => {
    if (extra) {
      setLabel(extra.label);
      setPercent(String(extra.percent));
    }
  }, [extra]);

  if (!open || !extra) return null;

  const save = () => {
    const l = label.trim();
    if (!l) return;
    onSave({
      ...extra,
      label: l,
      percent: Number(percent) || 0,
    });
    onClose();
  };

  const isNew = extra.id.startsWith("new_");

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn shadow-xl"
              >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {isNew ? "เพิ่มบริการเพิ่มเติม" : "แก้ไขบริการเพิ่มเติม"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อบริการ
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="เช่น เดินทางต่างจังหวัด"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              % ที่บวกเพิ่มจากราคางาน
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="flex-1 border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <span className="text-gray-500 font-medium">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              คำนวณจากยอดรวมรายการบริการ
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
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

        {!isNew && extra.removable && onDelete && (
          <button
            onClick={() => {
              if (confirm("ลบบริการนี้?")) {
                onDelete(extra.id);
                onClose();
              }
            }}
            className="w-full mt-3 text-sm text-red-500 hover:text-red-600 py-2"
          >
            ลบรายการนี้
          </button>
        )}
      </div>
    </div>
  );
}
