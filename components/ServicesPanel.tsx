"use client";

import { QuoteSettings, Service } from "@/lib/types";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  data: QuoteSettings;
  update: (patch: Partial<QuoteSettings>) => void;
}

export default function ServicesPanel({ data, update }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newFree, setNewFree] = useState(false);

  const addService = () => {
    const name = newName.trim();
    if (!name) return;
    const service: Service = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      price: Number(newPrice) || 0,
      free: newFree,
    };
    update({ services: [...data.services, service] });
    setNewName("");
    setNewPrice("");
    setNewFree(false);
  };

  const removeService = (id: string) => {
    update({ services: data.services.filter((s) => s.id !== id) });
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="text-gray-500 hover:text-brand-500"
          aria-label="ขยาย"
        >
          <ChevronRight size={18} />
        </button>
        <div className="mt-4 [writing-mode:vertical-rl] text-xs text-gray-500 tracking-wider">
          จัดการบริการ
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">จัดการบริการ</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="ย่อ"
        >
          <ChevronDown size={16} className="rotate-90" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5 text-sm">
        <section>
          <h3 className="font-medium text-gray-700 mb-2">เพิ่มใหม่</h3>
          <div className="bg-orange-50/60 border border-orange-100 rounded-lg p-3 space-y-2">
            <input
              placeholder="ชื่อบริการ"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <input
              type="number"
              placeholder="ราคา (฿)"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newFree}
                onChange={(e) => setNewFree(e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
              แถมฟรี
            </label>
            <button
              onClick={addService}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-md font-medium flex items-center justify-center gap-2 transition"
            >
              <Plus size={16} /> เพิ่ม
            </button>
          </div>
        </section>

        <section>
          <h3 className="font-medium text-gray-700 mb-2">บริการของคุณ</h3>
          {data.services.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">
              ยังไม่มีบริการ
            </p>
          ) : (
            <ul className="space-y-2">
              {data.services.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 animate-fadeIn"
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">
                      {s.name}{" "}
                      {s.free && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">
                          ฟรี
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.free ? "—" : `฿${s.price.toLocaleString()}`}
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(s.id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="ลบ"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pt-2 border-t border-gray-100">
          <h3 className="font-medium text-gray-700 mb-2">เพิ่มเติม</h3>
          <div className="space-y-2">
            <Check
              label="ไฟล์ต้นฉบับ (+20%)"
              checked={data.extras.sourceFile}
              onChange={(v) =>
                update({ extras: { ...data.extras, sourceFile: v } })
              }
            />
            <Check
              label="สิทธิ์เชิงพาณิชย์ (+30%)"
              checked={data.extras.commercialRights}
              onChange={(v) =>
                update({ extras: { ...data.extras, commercialRights: v } })
              }
            />
            <Check
              label="งานด่วน (+25%)"
              checked={data.extras.urgent}
              onChange={(v) =>
                update({ extras: { ...data.extras, urgent: v } })
              }
            />
          </div>
        </section>

        <section>
          <label className="block font-medium text-gray-700 mb-2">ส่วนลด</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={data.discount}
              onChange={(e) => update({ discount: Number(e.target.value) })}
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <select
              value={data.discountUnit}
              onChange={(e) =>
                update({ discountUnit: e.target.value as "baht" | "percent" })
              }
              className="border border-gray-200 rounded-md px-2 py-2 bg-white"
            >
              <option value="percent">%</option>
              <option value="baht">฿</option>
            </select>
          </div>
        </section>
      </div>
    </aside>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-brand-500 rounded"
      />
      {label}
    </label>
  );
}
