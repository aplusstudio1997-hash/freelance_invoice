"use client";

import { QuoteSettings } from "@/lib/types";
import { CalcResult, fmt } from "@/lib/calc";
import { Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  data: QuoteSettings;
  update: (patch: Partial<QuoteSettings>) => void;
  calc: CalcResult;
}

export default function TimelinePanel({ data, update, calc }: Props) {
  const [collapsed, setCollapsed] = useState(false);

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
          ไทม์ไลน์
        </div>
      </div>
    );
  }

  const timelineMarkers = buildTimelineMarkers(data.startDate, data.endDate);

  return (
    <section className="flex-1 min-w-0 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">ไทม์ไลน์</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="ย่อ"
        >
          <ChevronDown size={16} className="rotate-90" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        <section>
          <h3 className="font-medium text-gray-700 mb-3">ไทม์ไลน์โครงการ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">วันที่เริ่ม</label>
              <input
                type="date"
                value={data.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">วันที่จบงาน</label>
              <input
                type="date"
                value={data.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6">
          {timelineMarkers.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              เลือกวันที่เริ่มเพื่อดูไทม์ไลน์
            </p>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                <span>{timelineMarkers[0].label}</span>
                <span>{timelineMarkers[timelineMarkers.length - 1].label}</span>
              </div>
              <div className="relative h-2 bg-orange-100 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full" />
                {timelineMarkers.map((m, i) => (
                  <div
                    key={i}
                    className="absolute -top-1.5 w-5 h-5 bg-white border-2 border-brand-500 rounded-full shadow-sm"
                    style={{
                      left: `${m.pos}%`,
                      transform: "translateX(-50%)",
                    }}
                    title={m.label}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-500">
                {timelineMarkers.map((m, i) => (
                  <span key={i}>{m.label}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4 text-brand-600">
            <Clock size={18} />
            <h3 className="font-medium">อัตรารายชั่วโมง</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">จำนวนวันทำงาน</span>
              <span className="font-medium">{calc.workingDays}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">ชั่วโมงรวม (8h/d)</span>
              <span className="font-medium">{calc.totalHours}</span>
            </div>
            <div className="flex justify-between py-1 text-brand-600 font-semibold">
              <span>ราคา/ชั่วโมง</span>
              <span>฿{fmt(calc.hourlyRate)}</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function buildTimelineMarkers(
  start: string,
  end: string
): { pos: number; label: string }[] {
  if (!start || !end) return [];
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return [];

  const total = e.getTime() - s.getTime();
  if (total === 0) {
    return [{ pos: 50, label: formatShort(s) }];
  }

  const markers = [0, 0.25, 0.5, 0.75, 1].map((r) => {
    const d = new Date(s.getTime() + total * r);
    return { pos: r * 100, label: formatShort(d) };
  });
  return markers;
}

function formatShort(d: Date): string {
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
