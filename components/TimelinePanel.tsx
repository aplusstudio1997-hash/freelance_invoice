"use client";

import { QuoteSettings, Milestone } from "@/lib/types";
import { CalcResult, fmt, fmtDateShort, buildMilestones } from "@/lib/calc";
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  data: QuoteSettings;
  update: (patch: Partial<QuoteSettings>) => void;
  calc: CalcResult;
  currencySymbol: string;
}

export default function TimelinePanel({
  data,
  update,
  calc,
  currencySymbol,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const computedMilestones = useMemo(
    () =>
      buildMilestones(
        data.startDate,
        data.endDate,
        data.revisions,
        data.milestones
      ),
    [data.startDate, data.endDate, data.revisions, data.milestones]
  );

  useEffect(() => {
    const serialize = (m: Milestone[]) =>
      m.map((x) => `${x.id}|${x.date}`).join(",");
    if (serialize(data.milestones) !== serialize(computedMilestones)) {
      update({ milestones: computedMilestones });
    }
  }, [computedMilestones, data.milestones, update]);

  const updateMilestoneDate = (id: string, date: string) => {
    update({
      milestones: computedMilestones.map((m) =>
        m.id === id ? { ...m, date } : m
      ),
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
          ไทม์ไลน์
        </div>
      </div>
    );
  }

  const depositAmount = calc.deposit;
  const depositPercent =
    data.paymentTerm === "full" ? "100%" : `${data.paymentTerm}%`;

  return (
    <section className="flex-1 min-w-0 bg-gray-50 lg:border-r border-gray-200 flex flex-col h-full">
      <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <CalendarDays size={14} className="text-indigo-500" />
          ไทม์ไลน์
        </h2>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="ย่อ"
        >
          <ChevronDown size={16} className="rotate-90" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6 space-y-5">
        <section>
          <h3 className="font-medium text-gray-700 mb-3">ไทม์ไลน์โครงการ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">วันที่เริ่ม</label>
              <input
                type="date"
                value={data.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">วันที่จบงาน</label>
              <input
                type="date"
                value={data.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>
        </section>

        {data.startDate && data.endDate ? (
          <section className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <h3 className="font-medium text-gray-700 mb-4">ลำดับงาน</h3>
            <div className="relative pl-2">
              {computedMilestones.map((m, i) => {
                const isLast = i === computedMilestones.length - 1;
                const isFirst = i === 0;
                const isEndpoint = m.type === "deposit" || m.type === "final";
                return (
                  <div key={m.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {!isLast && (
                      <div
                        className="absolute left-[11px] top-5 w-0.5 bg-gray-200"
                        style={{ height: "calc(100% - 0.5rem)" }}
                      />
                    )}
                    <div className="relative z-10 shrink-0 mt-0.5">
                      {isEndpoint ? (
                        <CheckCircle2
                          size={24}
                          className="text-brand-500 bg-gray-50 rounded-full"
                          fill={isFirst ? "#f97316" : "white"}
                          strokeWidth={2}
                        />
                      ) : (
                        <Circle
                          size={24}
                          className="text-brand-400 bg-gray-50 rounded-full"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 text-sm">
                            {m.label}
                          </div>
                          {m.type === "deposit" && (
                            <div className="text-xs text-brand-600 mt-0.5">
                              มัดจำ {depositPercent} · {currencySymbol}
                              {fmt(depositAmount)}
                            </div>
                          )}
                          {m.type === "final" && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              ชำระเต็มจำนวน
                            </div>
                          )}
                          {m.type === "draft" && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              การสำรวจหลักการ
                            </div>
                          )}
                          {m.type === "revision" && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              รวมแล้ว
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="date"
                        value={m.date}
                        onChange={(e) =>
                          updateMilestoneDate(m.id, e.target.value)
                        }
                        className="w-full sm:w-44 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm">
            เลือกวันที่เริ่มและวันจบ เพื่อดูไทม์ไลน์
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
          <div className="flex items-center gap-2 mb-4 text-brand-600">
            <Clock size={18} />
            <h3 className="font-medium">อัตรารายชั่วโมง</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-600">จำนวนวันทำงาน</span>
              <span className="font-medium">{calc.workingDays}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-600">ชั่วโมงรวม (8h/d)</span>
              <span className="font-medium">{calc.totalHours}</span>
            </div>
            <div className="flex justify-between py-1.5 text-brand-600 font-semibold">
              <span>ราคา/ชั่วโมง</span>
              <span>
                {currencySymbol}
                {fmt(calc.hourlyRate)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
