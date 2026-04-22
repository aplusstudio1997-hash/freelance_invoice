"use client";

import { useEffect, useState } from "react";
import {
  QuoteSettings,
  DEFAULT_QUOTE,
  Profile,
  DEFAULT_PROFILE,
  getCurrencySymbol,
} from "@/lib/types";
import { loadDraft, loadProfile } from "@/lib/storage";
import { calculate, fmt, fmtDate, buildMilestones } from "@/lib/calc";

export default function PrintPage() {
  const [data, setData] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadDraft());
    setProfile(loadProfile());
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
  const currencySymbol = getCurrencySymbol(profile.currency);
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

  const milestones = buildMilestones(
    data.startDate,
    data.endDate,
    data.revisions,
    data.milestones
  );

  const termsLines = profile.terms
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean);

  const pay = profile.payment;
  const hasPayment =
    pay.qrCode || pay.bankName || pay.accountName || pay.accountNumber;

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
          <div className="flex items-start gap-3 flex-1 pr-4">
            {profile.logo && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.logo}
                alt="logo"
                className="w-14 h-14 rounded-md object-contain border border-gray-100 shrink-0"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 mb-0.5">
                {profile.studioName || "FreelanceSolo"}
              </h1>
              <p className="text-xs text-gray-500">{profile.tagline}</p>
              {(profile.phone || profile.email) && (
                <p className="text-[11px] text-gray-500 mt-1">
                  {profile.phone && <>โทร. {profile.phone}</>}
                  {profile.phone && profile.email && " · "}
                  {profile.email}
                </p>
              )}
              {profile.socialLink && (
                <p className="text-[11px] text-brand-600 mt-0.5">
                  {profile.socialLink.replace(/^https?:\/\//, "")}
                </p>
              )}
            </div>
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
                <th className="text-right py-2 font-medium w-36">
                  ราคา ({currencySymbol})
                </th>
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
                data.services.map((s) => {
                  const qty = Math.max(1, s.quantity || 1);
                  const lineTotal = s.free ? 0 : s.price * qty;
                  return (
                    <tr key={s.id} className="border-b border-gray-100">
                      <td className="py-2.5 align-top">
                        <div>
                          {s.name}
                          {s.free && (
                            <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              แถมฟรี
                            </span>
                          )}
                        </div>
                        {!s.free && qty > 1 && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            @ {currencySymbol}
                            {fmt(s.price)} × {qty}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-right tabular-nums align-top">
                        {s.free ? "—" : fmt(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}

              {calc.difficultyFee > 0 && (
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-2 text-sm">ค่าความซับซ้อนของโครงการ</td>
                  <td className="py-2 text-right tabular-nums">
                    {fmt(calc.difficultyFee)}
                  </td>
                </tr>
              )}
              {calc.extrasBreakdown.map((x, i) => (
                <tr key={i} className="border-b border-gray-100 text-gray-600">
                  <td className="py-2 text-sm">{x.label}</td>
                  <td className="py-2 text-right tabular-nums">
                    {fmt(x.amount)}
                  </td>
                </tr>
              ))}
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
            <span className="tabular-nums">
              {currencySymbol}
              {fmt(calc.subtotal)}
            </span>
          </div>
          <div className="flex justify-between py-2.5 px-3 mt-2 bg-orange-50 rounded text-brand-600 font-semibold">
            <span>รวมทั้งสิ้น</span>
            <span className="tabular-nums">
              {currencySymbol}
              {fmt(calc.total)}
            </span>
          </div>
          <div className="flex justify-between py-2.5 px-3 mt-1 bg-orange-50 rounded text-brand-600 font-semibold">
            <span>มัดจำที่ต้องชำระ</span>
            <span className="tabular-nums">
              {currencySymbol}
              {fmt(calc.deposit)}
            </span>
          </div>
        </section>

        <section className="bg-orange-50 border-l-4 border-brand-500 p-4 rounded mb-6">
          <div className="text-xs text-gray-500 mb-1">เงื่อนไขการชำระ</div>
          <div className="text-sm font-medium text-gray-800">
            {data.paymentCondition} (มัดจำ {termLabel[data.paymentTerm]})
          </div>
        </section>

        {hasPayment && (
          <section className="border border-gray-200 rounded-lg p-4 mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              ช่องทางการชำระเงิน
            </div>
            <div className="flex items-start gap-4">
              {pay.qrCode && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={pay.qrCode}
                  alt="Payment QR"
                  className="w-28 h-28 rounded border border-gray-200 object-contain bg-white shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1 text-sm pt-1">
                {pay.bankName && (
                  <div>
                    <span className="text-gray-500 text-xs">ธนาคาร: </span>
                    <span className="font-medium text-gray-800">
                      {pay.bankName}
                    </span>
                  </div>
                )}
                {pay.accountName && (
                  <div>
                    <span className="text-gray-500 text-xs">ชื่อบัญชี: </span>
                    <span className="font-medium text-gray-800">
                      {pay.accountName}
                    </span>
                  </div>
                )}
                {pay.accountNumber && (
                  <div>
                    <span className="text-gray-500 text-xs">เลขบัญชี: </span>
                    <span className="font-bold text-brand-600 tracking-wider">
                      {pay.accountNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {data.startDate && data.endDate && milestones.length > 0 && (
          <section className="mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              ลำดับงานและกำหนดส่ง
            </div>
            <div className="relative pl-2">
              {milestones.map((m, i) => {
                const isLast = i === milestones.length - 1;
                const isEndpoint = m.type === "deposit" || m.type === "final";
                return (
                  <div key={m.id} className="relative flex gap-3 pb-3 last:pb-0">
                    {!isLast && (
                      <div
                        className="absolute left-[7px] top-4 w-0.5 bg-gray-300"
                        style={{ height: "calc(100% - 0.5rem)" }}
                      />
                    )}
                    <div className="relative z-10 shrink-0 mt-1">
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-brand-500 ${
                          isEndpoint ? "bg-brand-500" : "bg-white"
                        }`}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 text-sm border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-800">
                        {m.label}
                      </span>
                      <span className="text-xs text-gray-500 tabular-nums">
                        {m.date ? fmtDate(m.date) : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="flex items-end justify-between mt-12 mb-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">เตรียมโดย</div>
            <div className="font-semibold text-gray-800">
              {profile.ownerName || profile.studioName}
            </div>
            {profile.taxId && (
              <div className="text-xs text-gray-500 mt-0.5">
                เลขประจำตัว: {profile.taxId}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="border-b border-gray-400 w-48 mb-1"></div>
            <div className="text-xs text-gray-500">ลงนามผู้เสนอราคา</div>
          </div>
        </section>

        {termsLines.length > 0 && (
          <section className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              หมายเหตุและเงื่อนไข
            </div>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
              {termsLines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
              <li>ราคานี้มีผลภายใน 30 วันนับจากวันที่เสนอ</li>
            </ul>
          </section>
        )}
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
