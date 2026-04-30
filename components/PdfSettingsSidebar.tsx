"use client";

import { Eye, EyeOff, Settings2 } from "lucide-react";

export interface PdfVisibility {
  contactFrom: boolean;
  contactTo: boolean;
  project: boolean;
  duration: boolean;
  services: boolean;
  extras: boolean;
  discount: boolean;
  vat: boolean;
  withholding: boolean;
  deposit: boolean;
  paymentCondition: boolean;
  paymentChannel: boolean;
  signature: boolean;
  notes: boolean;
  milestones: boolean;
}

export const DEFAULT_VISIBILITY: PdfVisibility = {
  contactFrom: true,
  contactTo: true,
  project: true,
  duration: true,
  services: true,
  extras: true,
  discount: true,
  vat: true,
  withholding: true,
  deposit: true,
  paymentCondition: true,
  paymentChannel: true,
  signature: true,
  notes: true,
  milestones: true,
};

type GroupedItem = { key: keyof PdfVisibility; label: string };
type Group = { title: string; items: GroupedItem[] };

const GROUPS: Group[] = [
  {
    title: "ข้อมูลติดต่อ",
    items: [
      { key: "contactFrom", label: "จาก (ผู้ส่ง)" },
      { key: "contactTo", label: "ถึง (ลูกค้า)" },
    ],
  },
  {
    title: "โครงการ",
    items: [
      { key: "project", label: "ชื่อโครงการ" },
      { key: "duration", label: "ระยะเวลา" },
    ],
  },
  {
    title: "รายการ",
    items: [
      { key: "services", label: "บริการ" },
      { key: "extras", label: "รายการพิเศษ" },
    ],
  },
  {
    title: "การคำนวณ",
    items: [
      { key: "discount", label: "ส่วนลด" },
      { key: "vat", label: "VAT" },
      { key: "withholding", label: "หัก ณ ที่จ่าย" },
      { key: "deposit", label: "มัดจำที่ต้องชำระ" },
    ],
  },
  {
    title: "การชำระเงิน",
    items: [
      { key: "paymentCondition", label: "เงื่อนไขการชำระ" },
      { key: "paymentChannel", label: "ช่องทางการชำระ" },
    ],
  },
  {
    title: "อื่น ๆ",
    items: [
      { key: "signature", label: "ลงนามและเตรียมโดย" },
      { key: "notes", label: "หมายเหตุและเงื่อนไข" },
      { key: "milestones", label: "ลำดับงาน" },
    ],
  },
];

interface Props {
  visibility: PdfVisibility;
  onChange: (next: PdfVisibility) => void;
  onReset: () => void;
}

export default function PdfSettingsSidebar({
  visibility,
  onChange,
  onReset,
}: Props) {
  const toggle = (key: keyof PdfVisibility) => {
    onChange({ ...visibility, [key]: !visibility[key] });
  };
  const allOn = () => {
    const next = { ...visibility };
    (Object.keys(next) as (keyof PdfVisibility)[]).forEach((k) => {
      next[k] = true;
    });
    onChange(next);
  };
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const totalCount = Object.values(visibility).length;

  return (
    <aside className="pdf-settings-sidebar no-print">
      <div className="sidebar-inner">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Settings2 size={16} className="text-brand-500" />
          <h3 className="font-semibold text-gray-800 text-sm">
            แสดงใน PDF
          </h3>
          <span className="ml-auto text-[11px] text-gray-400 tabular-nums">
            {visibleCount}/{totalCount}
          </span>
        </div>

        <div className="flex gap-2 py-2 border-b border-gray-100">
          <button
            onClick={allOn}
            className="flex-1 text-[11px] text-brand-600 hover:bg-brand-50 py-1.5 rounded transition"
          >
            แสดงทั้งหมด
          </button>
          <button
            onClick={onReset}
            className="flex-1 text-[11px] text-gray-500 hover:bg-gray-50 py-1.5 rounded transition"
          >
            รีเซ็ต
          </button>
        </div>

        <div className="space-y-3 pt-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
                {g.title}
              </div>
              <div className="space-y-1">
                {g.items.map((it) => {
                  const on = visibility[it.key];
                  return (
                    <button
                      key={it.key}
                      onClick={() => toggle(it.key)}
                      className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded text-xs transition ${
                        on
                          ? "bg-brand-50 text-gray-800"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`shrink-0 ${
                          on ? "text-brand-500" : "text-gray-300"
                        }`}
                      >
                        {on ? <Eye size={14} /> : <EyeOff size={14} />}
                      </span>
                      <span className="truncate">{it.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
