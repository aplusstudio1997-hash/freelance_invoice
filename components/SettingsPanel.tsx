"use client";

import { QuoteSettings, ExtraOption } from "@/lib/types";
import {
  ChevronDown,
  Briefcase,
  User,
  AlertTriangle,
  Coins,
  CreditCard,
  Plus,
  Settings2,
  Sliders,
} from "lucide-react";
import { useState } from "react";
import ExtraEditModal from "./ExtraEditModal";
import ClientPicker from "./clients/ClientPicker";

interface Props {
  data: QuoteSettings;
  update: (patch: Partial<QuoteSettings>) => void;
  currencySymbol: string;
}

export default function SettingsPanel({
  data,
  update,
  currencySymbol,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(true);
  const [difficultyOpen, setDifficultyOpen] = useState(true);
  const [editingDifficulty, setEditingDifficulty] = useState<ExtraOption | null>(null);

  const toggleDifficulty = (id: string) => {
    update({
      difficulties: data.difficulties.map((x) =>
        x.id === id ? { ...x, enabled: !x.enabled } : x
      ),
    });
  };

  const saveDifficulty = (x: ExtraOption) => {
    if (x.id.startsWith("new_")) {
      const finalX: ExtraOption = {
        ...x,
        id: `diff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        enabled: true,
        removable: true,
      };
      update({ difficulties: [...data.difficulties, finalX] });
    } else {
      update({
        difficulties: data.difficulties.map((it) =>
          it.id === x.id ? x : it
        ),
      });
    }
  };

  const deleteDifficulty = (id: string) => {
    update({ difficulties: data.difficulties.filter((x) => x.id !== id) });
  };

  const openNewDifficulty = () => {
    setEditingDifficulty({
      id: `new_${Date.now()}`,
      label: "",
      percent: 10,
      enabled: true,
      removable: true,
    });
  };

  return (
    <>
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-orange-100 hover:bg-orange-50/30 transition"
        >
          <h2 className="font-semibold text-ink-900 flex items-center gap-2 text-base">
            <Sliders size={16} className="text-brand-500" />
            ตั้งค่าใบเสนอราคา
          </h2>
          <ChevronDown
            size={18}
            className={`text-ink-400 transition ${collapsed ? "-rotate-90" : ""}`}
          />
        </button>

        {!collapsed && (
        <div className="p-5 space-y-5 text-sm">
          <section>
            <SectionHeader
              icon={<Briefcase size={15} className="text-brand-500" />}
              label="ข้อมูลโครงการ"
            />
            <div className="flex flex-wrap gap-3">
              <div className="w-full sm:w-[28rem]">
                <Label>ชื่อโครงการ</Label>
                <Input
                  placeholder="เช่น ออกแบบเว็บบริษัท ABC"
                  value={data.projectName}
                  onChange={(v) => update({ projectName: v })}
                />
              </div>
              <div className="w-full sm:w-[180px]">
                <Label>เลขที่เอกสาร</Label>
                <input
                  placeholder="QT-2025-001"
                  value={data.quoteNumber}
                  onChange={(e) => update({ quoteNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
          </section>

          <section>
            <SectionToggle
              open={customerOpen}
              onToggle={() => setCustomerOpen(!customerOpen)}
              icon={<User size={15} className="text-blue-500" />}
              label="ลูกค้า"
            />
            {customerOpen && (
              <div className="space-y-3">
                <div className="w-full sm:max-w-md">
                  <ClientPicker />
                </div>
                <div className="border-t border-orange-100 -mx-1" />
                <div className="flex flex-wrap gap-3">
                  <div className="w-full sm:w-[28rem]">
                    <Label>ชื่อลูกค้า</Label>
                    <Input
                      placeholder="ชื่อ-นามสกุล หรือชื่อบริษัท"
                      value={data.customer.name}
                      onChange={(v) =>
                        update({ customer: { ...data.customer, name: v } })
                      }
                    />
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <Label>เบอร์โทร</Label>
                    <Input
                      placeholder="08x-xxx-xxxx"
                      type="tel"
                      value={data.customer.phone}
                      onChange={(v) =>
                        update({ customer: { ...data.customer, phone: v } })
                      }
                    />
                  </div>
                  <div className="w-full sm:w-[220px]">
                    <Label>Line ID</Label>
                    <Input
                      placeholder="@username"
                      value={data.customer.lineId}
                      onChange={(v) =>
                        update({ customer: { ...data.customer, lineId: v } })
                      }
                    />
                  </div>
                  <div className="w-full sm:w-[24rem]">
                    <Label>Email</Label>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      value={data.customer.email}
                      onChange={(v) =>
                        update({ customer: { ...data.customer, email: v } })
                      }
                    />
                  </div>
                </div>
                <div className="w-full sm:max-w-2xl">
                  <Label>ที่อยู่</Label>
                  <textarea
                    placeholder="ที่อยู่สำหรับออกใบกำกับภาษี"
                    value={data.customer.address}
                    onChange={(e) =>
                      update({ customer: { ...data.customer, address: e.target.value } })
                    }
                    rows={2}
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 resize-none"
                  />
                </div>
                <div className="w-full sm:w-[220px]">
                  <Label>เลขประจำตัวผู้เสียภาษี</Label>
                  <Input
                    placeholder="13 หลัก"
                    value={data.customer.taxId}
                    onChange={(v) =>
                      update({ customer: { ...data.customer, taxId: v } })
                    }
                  />
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setDifficultyOpen(!difficultyOpen)}
                className="flex items-center gap-1.5 font-medium text-gray-700 text-left"
              >
                <AlertTriangle size={15} className="text-amber-500" />
                ความยากของลูกค้า
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    difficultyOpen ? "" : "-rotate-90"
                  }`}
                />
              </button>
              {difficultyOpen && (
                <button
                  onClick={openNewDifficulty}
                  className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus size={14} /> เพิ่ม
                </button>
              )}
            </div>

            {difficultyOpen && (
              <div className="space-y-1.5">
                {data.difficulties.map((x) => (
                  <div
                    key={x.id}
                    className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1.5"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 flex-1 min-w-0 py-0.5">
                      <input
                        type="checkbox"
                        checked={x.enabled}
                        onChange={() => toggleDifficulty(x.id)}
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
                      onClick={() => setEditingDifficulty(x)}
                      className="text-gray-400 hover:text-brand-500 p-1"
                      aria-label="แก้ไข"
                    >
                      <Settings2 size={14} />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-500 leading-relaxed pt-1 px-1">
                  💡 รายการเหล่านี้จะ<span className="font-medium text-gray-600">ไม่แสดง</span>ในใบเสนอราคา
                  แต่จะเอา % รวมไปบวกในราคาบริการแทน (ปัดหลักสิบขึ้น)
                </p>
              </div>
            )}
          </section>

          <section>
            <SectionHeader
              icon={<Coins size={15} className="text-yellow-500" />}
              label={`ค่าต้นทุนแฝงอื่นๆ (${currencySymbol})`}
            />
            <div className="w-full sm:w-[180px]">
              <Input
                placeholder="0"
                type="number"
                value={data.hiddenCost}
                onChange={(v) => update({ hiddenCost: v })}
              />
            </div>
          </section>

          <section>
            <SectionHeader
              icon={<CreditCard size={15} className="text-emerald-500" />}
              label="เงื่อนไขการชำระ"
            />
            <div className="max-w-md space-y-2">
              <div className="grid grid-cols-4 gap-1.5">
                {(["30", "50", "70", "full"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ paymentTerm: t })}
                    className={`px-1 py-2.5 rounded-md font-medium transition ${
                      t === "full" ? "text-xs" : "text-sm"
                    } ${
                      data.paymentTerm === t
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
                    }`}
                  >
                    {t === "full" ? "จ่ายเต็ม" : `${t}%`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                มัดจำ:{" "}
                <span className="text-brand-500 font-semibold">
                  {data.paymentTerm === "full"
                    ? "100%"
                    : `${data.paymentTerm}%`}
                </span>
              </p>
              <select
                value={data.paymentCondition}
                onChange={(e) => update({ paymentCondition: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white"
              >
                <option>ชำระมัดจำก่อนเริ่มงาน</option>
                <option>ชำระเต็มก่อนเริ่มงาน</option>
                <option>ชำระตามงวดที่ตกลง</option>
                <option>ชำระหลังส่งมอบงาน</option>
              </select>
            </div>
          </section>
        </div>
        )}
      </section>

      <ExtraEditModal
        open={editingDifficulty !== null}
        extra={editingDifficulty}
        onClose={() => setEditingDifficulty(null)}
        onSave={saveDifficulty}
        onDelete={deleteDifficulty}
      />
    </>
  );
}

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <label className="font-medium text-gray-700">{label}</label>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-gray-500 mb-1">{children}</label>
  );
}

function SectionToggle({
  open,
  onToggle,
  icon,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left mb-2"
    >
      <span className="flex items-center gap-1.5 font-medium text-gray-700">
        {icon}
        {label}
      </span>
      <ChevronDown
        size={16}
        className={`text-gray-400 transition-transform ${
          open ? "" : "-rotate-90"
        }`}
      />
    </button>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 ${className}`}
    />
  );
}
