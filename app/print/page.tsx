"use client";

import { useEffect, useState } from "react";
import { QuoteSettings, DEFAULT_QUOTE } from "@/lib/types";
import { loadDraft } from "@/lib/storage";
import { calculate, fmt, fmtDate } from "@/lib/calc";

export default function PrintPage() {
  const [data, setData] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadDraft());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(t);
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        กำลังเตรียมเอกสาร...
      </div>
    );
  }

  const calc = calculate(data);
  const today = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const termLabel: Record<string, string> = {
    "30": "30%",
    "50": "50%",
    "70": "70%",
    full: "100%",
  };

  return (
    <>
      <div className="print-toolbar no-print">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between py-3 px-4">
          <div className="text-sm text-gray-600">
            ถ้ากล่อง print ไม่เปิดอัตโนมัติ กด{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl/⌘ + P
            </kbd>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              พิมพ์ / บันทึก PDF
            </button>
            <button
              onClick={() => window.close()}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      <div className="print-page">
        <header className="flex items-start justify-between pb-4 border-b-[3px] border-brand-500">
          <div className="flex-1 pr-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {data.preparedBy || "FreelanceSolo"}
            </h1>
            <p className="text-xs text-gray-500">
              โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์อย่างง่าย
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-block bg-brand-500 text-white px-4 py-1.5 rounded font-semibold text-sm mb-2">
              ใบเสนอราคา
            </div>
            <div className="text-xs text-gray-500">{today}</div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 mt-6 mb-6">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              เรียน / สำหรับ
            </div>
            <div className="font-semibold text-gray-800 mb-0.5">
              {data.customer.name || "—"}
            </div>
            {data.customer.phone && (
              <div className="text-xs text-gray-600">
                โทร. {data.customer.phone}
              </div>
            )}
            {data.customer.email && (
              <div className="text-xs text-gray-600">{data.customer.email}</div>
            )}
            {data.customer.lineId && (
              <div className="text-xs text-gray-600">
                Line: {data.customer.lineId}
              </div>
            )}
            {data.customer.address && (
              <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                {data.customer.address}
              </div>
            )}
            {data.customer.taxId && (
              <div className="text-xs text-gray-600 mt-1">
                เลขประจำตัว: {data.customer.taxId}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              โครงการ
            </div>
            <div className="font-semibold text-gray-800 mb-0.5">
              {data.projectName || "—"}
            </div>
            {data.startDate && (
              <div className="text-xs text-gray-600 mt-1">
                {fmtDate(data.startDate)} — {fmtDate(data.endDate)}
              </div>
            )}
            {calc.workingDays > 0 && (
              <div className="text-xs text-gray-600">
                รวม {calc.workingDays} วันทำงาน
              </div>
            )}
          </div>
        </section>

        <section className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left py-2 font-medium">รายการ</th>
                <th className="text-right py-2 font-medium w-32">ราคา (บาท)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.services.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-gray-400">
                    ไม่มีรายการ
                  </td>
                </tr>
              ) : (
                data.services.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="py-2.5">
                      {s.name}
                      {s.free && (
                        <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          แถมฟรี
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {s.free ? "—" : fmt(s.price)}
                    </td>
                  </tr>
                ))
              )}

              {calc.difficultyFee > 0 && (
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-2 text-sm">ค่าความซับซ้อนของโครงการ</td>
                  <td className="py-2 text-right tabular-nums">
                    {fmt(calc.difficultyFee)}
                  </td>
                </tr>
              )}
              {calc.extrasFee > 0 && (
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-2 text-sm">บริการเพิ่มเติม</td>
                  <td className="py-2 text-right tabular-nums">
                    {fmt(calc.extrasFee)}
                  </td>
                </tr>
              )}
              {calc.hiddenCostNum > 0 && (
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-2 text-sm">ต้นทุนแฝงอื่นๆ</td>
                  <td className="py-2 text-right tabular-nums">
                    {fmt(calc.hiddenCostNum)}
                  </td>
                </tr>
              )}
              {calc.revisionFeeTotal > 0 && (
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-2 text-sm">
                    ค่าแก้ไขส่วนเกิน ({data.revisions - 3} รอบ)
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {fmt(calc.revisionFeeTotal)}
                  </td>
                </tr>
              )}
              {calc.discountValue > 0 && (
                <tr className="border-b border-gray-100 text-green-600">
                  <td className="py-2 text-sm">ส่วนลด</td>
                  <td className="py-2 text-right tabular-nums">
                    −{fmt(calc.discountValue)}
                  </td>
                </tr>
              )}
              {calc.taxDeduction > 0 && (
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-2 text-sm">หัก ณ ที่จ่าย 3%</td>
                  <td className="py-2 text-right tabular-nums">
                    −{fmt(calc.taxDeduction)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="mb-6 ml-auto w-80">
          <div className="flex justify-between py-2 text-sm text-gray-700 border-b border-gray-200">
            <span>ยอดรวม</span>
            <span className="tabular-nums">{fmt(calc.subtotal)} บาท</span>
          </div>
          <div className="flex justify-between py-2.5 px-3 mt-2 bg-orange-50 rounded text-brand-600 font-semibold">
            <span>รวมทั้งสิ้น</span>
            <span className="tabular-nums">{fmt(calc.total)} บาท</span>
          </div>
          <div className="flex justify-between py-2.5 px-3 mt-1 bg-orange-50 rounded text-brand-600 font-semibold">
            <span>มัดจำที่ต้องชำระ</span>
            <span className="tabular-nums">{fmt(calc.deposit)} บาท</span>
          </div>
        </section>

        <section className="bg-orange-50 border-l-4 border-brand-500 p-4 rounded mb-6">
          <div className="text-xs text-gray-500 mb-1">เงื่อนไขการชำระ</div>
          <div className="text-sm font-medium text-gray-800">
            {data.paymentCondition} (มัดจำ {termLabel[data.paymentTerm]})
          </div>
        </section>

        <section className="flex items-end justify-between mt-12 mb-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">เตรียมโดย</div>
            <div className="font-semibold text-gray-800">{data.preparedBy}</div>
          </div>
          <div className="text-right">
            <div className="border-b border-gray-400 w-48 mb-1"></div>
            <div className="text-xs text-gray-500">ลงนามผู้เสนอราคา</div>
          </div>
        </section>

        <section className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            หมายเหตุและเงื่อนไข
          </div>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
            <li>ชำระมัดจำเพื่อเริ่มงาน · โอนสิทธิ์ในผลงานเมื่อชำระครบ</li>
            <li>
              แก้ไขงานเกิน {data.revisions} รอบคิดเพิ่ม{" "}
              {fmt(data.revisionFee)}
              {data.revisionFeeUnit === "baht" ? " บาท" : "%"} ต่อรอบ
            </li>
            {data.extras.sourceFile && (
              <li>ส่งมอบไฟล์ต้นฉบับพร้อมงานที่ชำระเต็มจำนวน</li>
            )}
            {data.extras.commercialRights && (
              <li>โอนสิทธิ์การใช้งานเชิงพาณิชย์เต็มรูปแบบ</li>
            )}
            <li>ราคานี้มีผลภายใน 30 วันนับจากวันที่เสนอ</li>
            <li>
              ติดต่อ FreelanceSolo · เครื่องมือฟรีสำหรับฟรีแลนซ์
            </li>
          </ul>
        </section>
      </div>

      <style jsx global>{`
        body {
          background: #f3f4f6;
        }
        .print-toolbar {
          position: sticky;
          top: 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          z-index: 10;
        }
        .print-page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 20px auto;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          color: #1f2937;
        }
        @media print {
          body {
            background: white;
          }
          .print-toolbar {
            display: none !important;
          }
          .print-page {
            margin: 0;
            padding: 15mm;
            box-shadow: none;
            width: 100%;
            min-height: auto;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}
