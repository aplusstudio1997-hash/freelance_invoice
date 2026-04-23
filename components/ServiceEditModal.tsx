"use client";

import { Service } from "@/lib/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onSave: (s: Service) => void;
  currencySymbol: string;
}

export default function ServiceEditModal({
  open,
  service,
  onClose,
  onSave,
  currencySymbol,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || "");
      setPrice(String(service.price));
      setQuantity(String(service.quantity || 1));
    }
  }, [service]);

  if (!open || !service) return null;

  const save = () => {
    const n = name.trim();
    if (!n) return;
    onSave({
      ...service,
      name: n,
      description: description.trim(),
      price: Number(price) || 0,
      quantity: Math.max(1, Number(quantity) || 1),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn shadow-xl"
              >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">แก้ไขบริการ</h3>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียดงาน <span className="text-gray-400 text-xs">(ไม่บังคับ)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น ออกแบบ 3 แบบ พร้อมไฟล์ source"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคา/หน่วย ({currencySymbol})
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวน
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>
          <div className="bg-orange-50 rounded-md px-3 py-2 text-sm text-brand-600 font-medium">
            รวม: {currencySymbol}
            {(
              (Number(price) || 0) * Math.max(1, Number(quantity) || 1)
            ).toLocaleString("th-TH")}
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
      </div>
    </div>
  );
}
