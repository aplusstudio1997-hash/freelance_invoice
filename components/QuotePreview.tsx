"use client";

import { QuoteSettings } from "@/lib/types";
import { CalcResult, fmt, fmtDate } from "@/lib/calc";
import { Download, FileText } from "lucide-react";
import { forwardRef } from "react";

interface Props {
  data: QuoteSettings;
  calc: CalcResult;
  onDownload: () => void;
  downloading: boolean;
}

const QuotePreview = forwardRef<HTMLDivElement, Props>(function QuotePreview(
  { data, calc, onDownload, downloading },
  ref
) {
  const today = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const termLabel: Record<string, string> = {
    "30": "30%",
    "50": "50%",
    "70": "70%",
    full: "100%",
  };

  return (
    <aside className="w-full lg:w-96 bg-gray-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white no-print">
        <h2 className="text-sm font-semibold text-gray-700">ใบเสนอราคา</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div
          ref={ref}
          className="bg-white rounded-lg border border-gray-200 p-5 space-y-4 text-xs"
        >
          <header className="flex items-start justify-between pb-3 border-b-2 border-brand-500">
            <div>
              <div className="text-lg font-bold text-gray-800">
                {data.preparedBy || "FreelanceSolo"}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์อย่างง่าย
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-brand-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                ใบเสนอราคา
              </div>
              <div className="text-[10px] text-gray-500 mt-1">{today}</div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">เรียน/สำหรับ</div>
              <div className="font-medium">{data.customer.name || "—"}</div>
              {data.customer.phone && (
                <div className="text-gray-600 text-[11px]">
                  โทร. {data.customer.phone}
                </div>
              )}
              {data.customer.email && (
                <div className="text-gray-600 text-[11px]">
                  {data.customer.email}
                </div>
              )}
              {data.customer.address && (
                <div className="text-gray-600 text-[11px] mt-1">
                  {data.customer.address}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 mb-0.5">โครงการ</div>
              <div className="font-medium">{data.projectName || "—"}</div>
              {data.startDate && (
                <div className="text-gray-600 text-[11px] mt-1">
                  {fmtDate(data.startDate)} - {fmtDate(data.endDate)}
                </div>
              )}
            </div>
          </section>

          <section>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] text-gray-500">
                  <th className="text-left py-1.5 font-medium">รายการ</th>
                  <th className="text-right py-1.5 font-medium">ราคา</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {data.services.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-400">
                      ไม่มีรายการ
                    </td>
                  </tr>
                ) : (
                  data.services.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100">
                      <td className="py-1.5">
                        {s.name}
                        {s.free && (
                          <span className="ml-1.5 text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded">
                            ฟรี
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 text-right">
                        {s.free ? "—" : `฿${fmt(s.price)}`}
                      </td>
                    </tr>
                  ))
                )}

                {calc.difficultyFee > 0 && (
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="py-1.5">ค่าความซับซ้อน</td>
                    <td className="py-1.5 text-right">
                      ฿{fmt(calc.difficultyFee)}
                    </td>
                  </tr>
                )}
                {calc.extrasFee > 0 && (
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="py-1.5">บริการเพิ่มเติม</td>
                    <td className="py-1.5 text-right">฿{fmt(calc.extrasFee)}</td>
                  </tr>
                )}
                {calc.hiddenCostNum > 0 && (
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="py-1.5">ต้นทุนแฝง</td>
                    <td className="py-1.5 text-right">
                      ฿{fmt(calc.hiddenCostNum)}
                    </td>
                  </tr>
                )}
                {calc.revisionFeeTotal > 0 && (
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="py-1.5">
                      ค่าแก้ไขส่วนเกิน ({data.revisions - 3} รอบ)
                    </td>
                    <td className="py-1.5 text-right">
                      ฿{fmt(calc.revisionFeeTotal)}
                    </td>
                  </tr>
                )}
                {calc.discountValue > 0 && (
                  <tr className="border-b border-gray-100 text-green-600">
                    <td className="py-1.5">ส่วนลด</td>
                    <td className="py-1.5 text-right">
                      -฿{fmt(calc.discountValue)}
                    </td>
                  </tr>
                )}
                {calc.taxDeduction > 0 && (
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="py-1.5">หัก ณ ที่จ่าย 3%</td>
                    <td className="py-1.5 text-right">
                      -฿{fmt(calc.taxDeduction)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="space-y-1.5 pt-2">
            <Row label="ยอดรวม" value={`฿${fmt(calc.subtotal)}`} />
            <Row
              label="รวมทั้งสิ้น"
              value={`฿${fmt(calc.total)}`}
              highlight
            />
            <Row
              label="มัดจำที่ต้องชำระ"
              value={`฿${fmt(calc.deposit)}`}
              highlight
            />
          </section>

          <section className="bg-orange-50 border-l-4 border-brand-500 p-3 rounded">
            <div className="text-[10px] text-gray-500 mb-0.5">เงื่อนไขการชำระ</div>
            <div className="text-[11px] font-medium">
              {data.paymentCondition} (มัดจำ {termLabel[data.paymentTerm]})
            </div>
          </section>

          <section className="flex items-end justify-between pt-6">
            <div>
              <div className="text-[10px] text-gray-500">เตรียมโดย</div>
              <div className="font-semibold text-sm">{data.preparedBy}</div>
            </div>
            <div className="text-right">
              <div className="border-b border-gray-400 w-28 mb-1"></div>
              <div className="text-[10px] text-gray-500">ลงนาม</div>
            </div>
          </section>

          <section className="pt-2 border-t border-gray-100">
            <div className="text-[10px] text-gray-500 mb-1">หมายเหตุและเงื่อนไข</div>
            <ul className="text-[10px] text-gray-600 space-y-0.5 list-disc list-inside">
              <li>ชำระมัดจำเพื่อเริ่มงาน · โอนสิทธิ์เมื่อชำระครบ</li>
              <li>
                แก้ไขเพิ่มเติม ฿{fmt(data.revisionFee)} ต่อรอบ (รอบที่ 4+)
              </li>
              <li>ราคานี้มีผลภายใน 30 วันนับจากวันที่เสนอ</li>
            </ul>
          </section>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 no-print">
        <button
          onClick={onDownload}
          disabled={downloading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white py-3 rounded-md font-medium flex items-center justify-center gap-2 transition"
        >
          {downloading ? (
            <>
              <FileText size={18} className="animate-pulse" />
              กำลังสร้าง PDF...
            </>
          ) : (
            <>
              <Download size={18} /> ดาวน์โหลด PDF
            </>
          )}
        </button>
      </div>
    </aside>
  );
});

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-1.5 ${
        highlight
          ? "bg-orange-50 px-3 rounded text-brand-600 font-semibold"
          : "text-gray-700"
      }`}
    >
      <span className="text-[11px]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default QuotePreview;
