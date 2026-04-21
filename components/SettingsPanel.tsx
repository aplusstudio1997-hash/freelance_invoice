"use client";

import { QuoteSettings } from "@/lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  data: QuoteSettings;
  update: (patch: Partial<QuoteSettings>) => void;
}

export default function SettingsPanel({ data, update }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(true);
  const [difficultyOpen, setDifficultyOpen] = useState(true);

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
    <aside className="w-full lg:w-72 bg-white lg:border-r border-gray-200 flex flex-col h-full">
      <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">ตั้งค่าใบเสนอราคา</h2>
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
          <button
            onClick={() => setCustomerOpen(!customerOpen)}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <span className="font-medium text-gray-700">ลูกค้า</span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                customerOpen ? "" : "-rotate-90"
              }`}
            />
          </button>

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
          <label className="block font-medium text-gray-700 mb-2">โครงการ</label>
          <Input
            placeholder="ชื่อโครงการ"
            value={data.projectName}
            onChange={(v) => update({ projectName: v })}
          />
        </section>

        <section>
          <button
            onClick={() => setDifficultyOpen(!difficultyOpen)}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <span className="font-medium text-gray-700">ความยากของลูกค้า</span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                difficultyOpen ? "" : "-rotate-90"
              }`}
            />
          </button>

          {difficultyOpen && (
            <div className="space-y-2">
              <Check
                label="ยากต่อการสื่อสาร (+15%)"
                checked={data.difficultCommunication}
                onChange={(v) => update({ difficultCommunication: v })}
              />
              <Check
                label="เปลี่ยนใจบ่อยๆ (+10%)"
                checked={data.frequentChanges}
                onChange={(v) => update({ frequentChanges: v })}
              />
            </div>
          )}
        </section>

        <section>
          <label className="block font-medium text-gray-700 mb-2">
            ต้นทุนแฝงอื่นๆ
          </label>
          <Input
            placeholder="เช่น ค่าโปรแกรม/ซอฟต์แวร์"
            type="number"
            value={data.hiddenCost}
            onChange={(v) => update({ hiddenCost: v })}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700">รอบการแก้ไข</label>
            <span className="text-brand-500 font-semibold">{data.revisions}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={data.revisions}
            onChange={(e) => update({ revisions: Number(e.target.value) })}
            className="w-full accent-brand-500"
          />
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              inputMode="numeric"
              value={data.revisionFee}
              onChange={(e) => update({ revisionFee: Number(e.target.value) })}
              className="flex-1 border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <select
              value={data.revisionFeeUnit}
              onChange={(e) =>
                update({
                  revisionFeeUnit: e.target.value as "baht" | "percent",
                })
              }
              className="border border-gray-200 rounded-md px-2 py-2.5 bg-white"
            >
              <option value="baht">฿</option>
              <option value="percent">%</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-1">รอบที่ 4+ เป็นต้นไป</p>
        </section>

        <section>
          <label className="block font-medium text-gray-700 mb-2">ภาษี</label>
          <Check
            label="หักภาษี 3%"
            checked={data.tax3Percent}
            onChange={(v) => update({ tax3Percent: v })}
          />
        </section>

        <section>
          <label className="block font-medium text-gray-700 mb-2">
            เงื่อนไขการชำระ
          </label>
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
              {data.paymentTerm === "full" ? "100%" : `${data.paymentTerm}%`}
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
    <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-brand-500 rounded"
      />
      {label}
    </label>
  );
}
