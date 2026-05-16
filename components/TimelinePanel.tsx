"use client";

import { QuoteSettings, Milestone } from "@/lib/types";
import { CalcResult, fmt, fmtDateShort, buildMilestones } from "@/lib/calc";
import {
  Clock,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import DateInput from "./DateInput";

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

  const computedMilestones = useMemo(
    () => buildMilestones(data.startDate, data.endDate, data.milestones),
    [data.startDate, data.endDate, data.milestones]
  );

  // Keep `update` in a ref so it doesn't drive the effect — the parent passes
  // a fresh function reference every render, which would otherwise re-trigger
  // the effect and risk an infinite update loop. Compare every milestone
  // field (id/date/label/type) so divergence in any of them is corrected.
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    const serialize = (m: Milestone[]) =>
      m.map((x) => `${x.id}|${x.date}|${x.label}|${x.type}`).join(",");
    if (serialize(data.milestones) !== serialize(computedMilestones)) {
      updateRef.current({ milestones: computedMilestones });
    }
  }, [computedMilestones, data.milestones]);

  const updateMilestoneDate = (id: string, date: string) => {
    const patch: Partial<typeof data> = {
      milestones: computedMilestones.map((m) =>
        m.id === id ? { ...m, date } : m
      ),
    };
    if (id === "deposit") patch.startDate = date;
    if (id === "final") patch.endDate = date;
    update(patch);
  };

  const depositAmount = calc.deposit;
  const depositPercent =
    data.paymentTerm === "full" ? "100%" : `${data.paymentTerm}%`;

  return (
    <div className="space-y-5">
        <section>
          <h3 className="font-medium text-gray-700 mb-3">ไทม์ไลน์โครงการ</h3>
          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-[180px]">
              <label className="block text-sm text-gray-600 mb-1">วันที่เริ่ม</label>
              <DateInput
                value={data.startDate}
                onChange={(v) => update({ startDate: v })}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <label className="block text-sm text-gray-600 mb-1">วันที่จบงาน</label>
              <DateInput
                value={data.endDate}
                onChange={(v) => update({ endDate: v })}
              />
            </div>
          </div>
        </section>

        {data.startDate && data.endDate ? (
          <section className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 max-w-2xl">
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
                        </div>
                      </div>
                      <DateInput
                        value={m.date}
                        onChange={(v) => updateMilestoneDate(m.id, v)}
                        className="w-full sm:w-44"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm max-w-2xl">
            เลือกวันที่เริ่มและวันจบ เพื่อดูไทม์ไลน์
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5 max-w-md">
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
  );
}
