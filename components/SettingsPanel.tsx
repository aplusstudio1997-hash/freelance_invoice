"use client";

import { QuoteSettings, ExtraOption, generateQuoteNumber } from "@/lib/types";
import {
  ChevronDown,
  ChevronRight,
  Briefcase,
  User,
  AlertTriangle,
  Coins,
  CreditCard,
  Plus,
  Settings2,
  Sliders,
  Hash,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import ExtraEditModal from "./ExtraEditModal";

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
          ตั้งค่าใบเสนอราคา
        </div>
      </div>
    );
  }

  return (
    <>
      <aside className="w-full lg:w-72 bg-white lg:border-r border-gray-200 flex flex-col h-full">
        <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Sliders size={14} className="text-brand-500" />
            ตั้งค่าใบเสนอราคา
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
            <SectionHeader
              icon={<Briefcase size={15} className="text-brand-500" />}
              label="โครงการ"
            />
            <Input
              placeholder="ชื่อโครงการ"
              value={data.projectName}
              onChange={(v) => update({ projectName: v })}
            />
          </section>

          <section>
            <SectionHeader
              icon={<Hash size={15} className="text-cyan-500" />}
              label="เลขที่ใบเสนอราคา"
            />
            <div className="flex gap-2">
              <input
                placeholder="QT-2025-001"
                value={data.quoteNumber}
                onChange={(e) => update({ quoteNumber: e.target.value })}
                className="flex-1 border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <button
                onClick={() => update({ quoteNumber: generateQuoteNumber() })}
                className="px-3 py-2.5 border border-brand-200 text-brand-600 rounded-md hover:bg-brand-50 transition flex items-center gap-1 text-xs whitespace-nowrap"
                title="สร้างเลขที่อัตโนมัติ"
              >
                <Wand2 size={13} /> Auto
              </button>
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
              <div className="space-y-2">
                <Input
                  placeholder="ชื่อลูกค้า"
                  value={data.customer.name}
                  onChange={(v) =>
                    update({ customer: { ...data.customer, name: v } })
                  }
                />
                <Input
                  placeholder="เบอร์โทร"
                  type="tel"
                  value={data.customer.phone}
                  onChange={(v) =>
                    update({ customer: { ...data.customer, phone: v } })
                  }
                />
                <Input
                  placeholder="Line ID"
                  value={data.customer.lineId}
                  onChange={(v) =>
                    update({ customer: { ...data.customer, lineId: v } })
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={data.customer.email}
                  onChange={(v) =>
                    update({ customer: { ...data.customer, email: v } })
                  }
                />
                <Input
                  placeholder="ที่อยู่"
                  value={data.customer.address}
                  onChange={(v) =>
                    update({ customer: { ...data.customer, address: v } })
                  }
                />
                <Input
                  placeholder="เลขประชาชน/นิติบุคคล"
                  value={data.customer.taxId}
                  onChange={(v) =>
                    update({ customer: { ...data.customer, taxId: v } })
                  }
                />
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
              </div>
            )}
          </section>

          <section>
            <SectionHeader
              icon={<Coins size={15} className="text-yellow-500" />}
              label={`ค่าต้นทุนแฝงอื่นๆ (${currencySymbol})`}
            />
            <Input
              placeholder="0"
              type="number"
              value={data.hiddenCost}
              onChange={(v) => update({ hiddenCost: v })}
            />
          </section>

          <section>
            <SectionHeader
              icon={<CreditCard size={15} className="text-emerald-500" />}
              label="เงื่อนไขการชำระ"
            />
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {(["30", "50", "70", "full"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ paymentTerm: t })}
                  className={`px-1 py-2.5 rounded-md font-medium transition ${
                    t === "full" ? "text-[11px]" : "text-sm"
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
            <p className="text-xs text-gray-500 mb-2">
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
          </section>
        </div>
      </aside>

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
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
    />
  );
}
