"use client";

import { QuoteSettings, Service, ExtraOption } from "@/lib/types";
import { CalcResult } from "@/lib/calc";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Gift,
  Settings2,
  PackagePlus,
  ShoppingBasket,
  Sparkles,
  Tag,
  Receipt,
  Package,
} from "lucide-react";
import { useState } from "react";
import ServiceEditModal from "./ServiceEditModal";
import ExtraEditModal from "./ExtraEditModal";

interface Props {
  data: QuoteSettings;
  update: (patch: Partial<QuoteSettings>) => void;
  currencySymbol: string;
  calc: CalcResult;
}

export default function ServicesPanel({
  data,
  update,
  currencySymbol,
  calc,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingExtra, setEditingExtra] = useState<ExtraOption | null>(null);

  const addService = () => {
    const name = newName.trim();
    if (!name) return;
    const service: Service = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      price: Number(newPrice) || 0,
      quantity: Math.max(1, Number(newQuantity) || 1),
      free: false,
    };
    update({ services: [...data.services, service] });
    setNewName("");
    setNewPrice("");
    setNewQuantity("1");
  };

  const removeService = (id: string) => {
    update({ services: data.services.filter((s) => s.id !== id) });
  };

  const saveService = (s: Service) => {
    update({
      services: data.services.map((it) => (it.id === s.id ? s : it)),
    });
  };

  const toggleFree = (id: string) => {
    update({
      services: data.services.map((s) =>
        s.id === id ? { ...s, free: !s.free } : s
      ),
    });
  };

  const toggleExtra = (id: string) => {
    update({
      extras: data.extras.map((x) =>
        x.id === id ? { ...x, enabled: !x.enabled } : x
      ),
    });
  };

  const saveExtra = (x: ExtraOption) => {
    if (x.id.startsWith("new_")) {
      const finalX = {
        ...x,
        id: `extra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        enabled: true,
        removable: true,
      };
      update({ extras: [...data.extras, finalX] });
    } else {
      update({
        extras: data.extras.map((it) => (it.id === x.id ? x : it)),
      });
    }
  };

  const deleteExtra = (id: string) => {
    update({ extras: data.extras.filter((x) => x.id !== id) });
  };

  const openNewExtra = () => {
    setEditingExtra({
      id: `new_${Date.now()}`,
      label: "",
      percent: 10,
      enabled: true,
      removable: true,
    });
  };

  if (collapsed) {
    return (
      <div className="hidden lg:flex w-12 bg-white border-r border-gray-200 flex-col items-center py-4">
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
    <>
      <aside className="w-full lg:w-80 bg-white lg:border-r border-gray-200 flex flex-col h-full">
        <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Package size={14} className="text-brand-500" />
            จัดการบริการ
          </h2>
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
            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <PackagePlus size={15} className="text-brand-500" /> เพิ่มใหม่
            </h3>
            <div className="bg-orange-50/60 border border-orange-100 rounded-lg p-3 space-y-2">
              <input
                placeholder="ชื่อบริการ"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">
                    ราคา/หน่วย
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">
                    จำนวน
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              </div>
              <button
                onClick={addService}
                className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition"
              >
                <Plus size={16} /> เพิ่ม
              </button>
            </div>
          </section>

          <section>
            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <ShoppingBasket size={15} className="text-blue-500" /> บริการของคุณ
            </h3>
            {data.services.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">
                ยังไม่มีบริการ
              </p>
            ) : (
              <ul className="space-y-2">
                {data.services.map((s) => {
                  const qty = Math.max(1, s.quantity || 1);
                  const lineTotal = s.price * qty;
                  return (
                    <li
                      key={s.id}
                      className="bg-white border border-gray-200 rounded-md px-3 py-2.5 animate-fadeIn"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium truncate">
                              {s.name}
                            </span>
                            {s.free && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                ฟรี
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {s.free ? (
                              "—"
                            ) : (
                              <>
                                {currencySymbol}
                                {s.price.toLocaleString()} × {qty} ={" "}
                                <span className="text-gray-700 font-medium">
                                  {currencySymbol}
                                  {lineTotal.toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 -mb-1">
                        <button
                          onClick={() => toggleFree(s.id)}
                          className={`flex-1 text-xs px-2 py-1.5 rounded flex items-center justify-center gap-1 transition ${
                            s.free
                              ? "bg-green-100 text-green-700"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                          title="สลับฟรี"
                        >
                          <Gift size={12} />
                          {s.free ? "ฟรี" : "คิดเงิน"}
                        </button>
                        <button
                          onClick={() => setEditingService(s)}
                          className="flex-1 text-xs px-2 py-1.5 rounded text-gray-500 hover:bg-gray-100 flex items-center justify-center gap-1"
                        >
                          <Pencil size={12} /> แก้ไข
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ลบ "${s.name}"?`))
                              removeService(s.id);
                          }}
                          className="text-xs px-2 py-1.5 rounded text-red-500 hover:bg-red-50"
                          aria-label="ลบ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700 flex items-center gap-1.5">
                <Sparkles size={15} className="text-purple-500" /> เพิ่มเติม
              </h3>
              <button
                onClick={openNewExtra}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus size={14} /> เพิ่ม
              </button>
            </div>
            <div className="space-y-1.5">
              {data.extras.map((x) => (
                <div
                  key={x.id}
                  className="flex items-center gap-2 group bg-gray-50 rounded-md px-2 py-1.5"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 flex-1 min-w-0 py-0.5">
                    <input
                      type="checkbox"
                      checked={x.enabled}
                      onChange={() => toggleExtra(x.id)}
                      className="w-5 h-5 accent-brand-500 rounded shrink-0"
                    />
                    <span className="truncate">
                      {x.label}{" "}
                      <span className="text-brand-600 text-xs">
                        (+{x.percent}%)
                      </span>
                    </span>
                  </label>
                  <button
                    onClick={() => setEditingExtra(x)}
                    className="text-gray-400 hover:text-brand-500 p-1"
                    aria-label="แก้ไข"
                  >
                    <Settings2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-3 border-t border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Receipt size={15} className="text-brand-500" /> สรุปใบเสนอราคา
            </h3>

            <div className="bg-gray-50 rounded-lg p-3 space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs">ยอดรวมก่อนภาษี</span>
                <span className="font-semibold tabular-nums text-gray-800">
                  {currencySymbol}
                  {calc.preDiscount.toLocaleString("th-TH", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <label className="flex items-center justify-between gap-2 cursor-pointer py-1 border-t border-gray-200 pt-2">
                <span className="flex items-center gap-2.5 text-gray-700">
                  <input
                    type="checkbox"
                    checked={data.vat7}
                    onChange={(e) => update({ vat7: e.target.checked })}
                    className="w-5 h-5 accent-brand-500 rounded"
                  />
                  VAT 7%
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    data.vat7 ? "text-brand-600 font-medium" : "text-gray-400"
                  }`}
                >
                  {data.vat7 ? "+" : ""}
                  {currencySymbol}
                  {calc.vatAmount.toLocaleString("th-TH", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </label>

              <label className="flex items-center justify-between gap-2 cursor-pointer py-1">
                <span className="flex items-center gap-2.5 text-gray-700">
                  <input
                    type="checkbox"
                    checked={data.tax3Percent}
                    onChange={(e) =>
                      update({ tax3Percent: e.target.checked })
                    }
                    className="w-5 h-5 accent-brand-500 rounded"
                  />
                  หัก ณ ที่จ่าย 3%
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    data.tax3Percent
                      ? "text-red-500 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {data.tax3Percent ? "−" : ""}
                  {currencySymbol}
                  {calc.taxDeduction.toLocaleString("th-TH", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </label>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Tag size={13} className="text-pink-500" />
                  <span className="text-xs text-gray-600 font-medium">
                    ส่วนลด
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={data.discount === 0 ? "" : data.discount}
                    onChange={(e) =>
                      update({
                        discount:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 text-sm"
                  />
                  <select
                    value={data.discountUnit}
                    onChange={(e) =>
                      update({
                        discountUnit: e.target.value as "baht" | "percent",
                      })
                    }
                    className="border border-gray-200 rounded-md px-2 py-2 bg-white text-sm"
                  >
                    <option value="percent">%</option>
                    <option value="baht">{currencySymbol}</option>
                  </select>
                </div>
                {calc.discountValue > 0 && (
                  <div className="text-right text-xs text-green-600 mt-1 tabular-nums">
                    −{currencySymbol}
                    {calc.discountValue.toLocaleString("th-TH", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t-2 border-brand-200 text-brand-600">
                <span className="font-semibold text-sm">ยอดรวมสุทธิ</span>
                <span className="font-bold text-base tabular-nums">
                  {currencySymbol}
                  {calc.total.toLocaleString("th-TH", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </section>
        </div>
      </aside>

      <ServiceEditModal
        open={editingService !== null}
        service={editingService}
        onClose={() => setEditingService(null)}
        onSave={saveService}
        currencySymbol={currencySymbol}
      />
      <ExtraEditModal
        open={editingExtra !== null}
        extra={editingExtra}
        onClose={() => setEditingExtra(null)}
        onSave={saveExtra}
        onDelete={deleteExtra}
      />
    </>
  );
}
