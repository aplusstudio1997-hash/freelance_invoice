"use client";

import { Eye, EyeOff, Settings2, X } from "lucide-react";
import { useState } from "react";

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

interface BodyProps {
  visibility: PdfVisibility;
  onChange: (next: PdfVisibility) => void;
  onReset: () => void;
}

function Body({ visibility, onChange, onReset }: BodyProps) {
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
  return (
    <>
      <div className="flex gap-2 py-2 border-b border-gray-100">
        <button
          onClick={allOn}
          className="flex-1 text-xs text-brand-600 hover:bg-brand-50 py-2 rounded transition"
        >
          แสดงทั้งหมด
        </button>
        <button
          onClick={onReset}
          className="flex-1 text-xs text-gray-500 hover:bg-gray-50 py-2 rounded transition"
        >
          รีเซ็ต
        </button>
      </div>

      <div className="space-y-3 pt-3 pr-1">
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
                    className={`w-full flex items-center gap-2 text-left px-2 py-2 rounded text-sm transition ${
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
                      {on ? <Eye size={16} /> : <EyeOff size={16} />}
                    </span>
                    <span className="truncate">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

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
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const totalCount = Object.values(visibility).length;

  return (
    <aside className="pdf-settings-desktop no-print">
      <div className="sidebar-inner">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Settings2 size={16} className="text-brand-500" />
          <h3 className="font-semibold text-gray-800 text-sm">แสดงใน PDF</h3>
          <span className="ml-auto text-[11px] text-gray-400 tabular-nums">
            {visibleCount}/{totalCount}
          </span>
        </div>
        <div className="lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto">
          <Body
            visibility={visibility}
            onChange={onChange}
            onReset={onReset}
          />
        </div>
      </div>
    </aside>
  );
}

export function PdfSettingsButton({
  visibility,
  onChange,
  onReset,
}: Props) {
  const [open, setOpen] = useState(false);
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const totalCount = Object.values(visibility).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-xs sm:text-sm whitespace-nowrap"
      >
        <Settings2 size={14} />
        <span>แสดงใน PDF</span>
        <span className="text-[10px] text-gray-400 tabular-nums">
          {visibleCount}/{totalCount}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 no-print">
          <div className="bg-white sm:rounded-xl w-full sm:max-w-md flex flex-col max-h-[85vh] sm:max-h-[80vh] shadow-xl rounded-t-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-brand-500" />
                <h3 className="font-semibold text-gray-800 text-sm">
                  แสดงใน PDF
                </h3>
                <span className="text-[11px] text-gray-400 tabular-nums">
                  {visibleCount}/{totalCount}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="ปิด"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <Body
                visibility={visibility}
                onChange={onChange}
                onReset={onReset}
              />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-md font-medium text-sm"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
