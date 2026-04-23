"use client";

import { QuoteSettings, Profile } from "@/lib/types";
import { CalcResult, fmt, fmtDate } from "@/lib/calc";
import { Download, FileText, Link2 } from "lucide-react";

interface Props {
  data: QuoteSettings;
  calc: CalcResult;
  profile: Profile;
  currencySymbol: string;
  onDownload: () => void;
  downloading: boolean;
}

export default function QuotePreview({
  data,
  calc,
  profile,
  currencySymbol,
  onDownload,
  downloading,
}: Props) {
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

  const termsLines = profile.terms
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean);

  const pay = profile.payment;
  const hasPayment =
    pay.qrCode || pay.bankName || pay.accountName || pay.accountNumber;

  return (
    <aside className="w-full lg:w-96 bg-gray-50 flex flex-col h-full">
      <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white no-print">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <FileText size={14} className="text-brand-500" />
          ใบเสนอราคา
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 space-y-4 text-xs shadow-sm">
          <header className="pb-3 border-b-2 border-brand-500">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {profile.logo && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.logo}
                    alt="logo"
                    className="w-10 h-10 rounded object-contain shrink-0 border border-gray-100 bg-white"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-lg font-bold text-gray-800 truncate">
                    {profile.studioName || "FreelanceSolo"}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-2">
                    {profile.tagline}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="inline-block bg-brand-500 text-white px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap">
                  ใบเสนอราคา
                </div>
                <div className="text-[10px] text-gray-700 mt-1.5 space-y-0.5">
                  {data.quoteNumber && (
                    <div>
                      <span className="text-gray-400">เลขที่: </span>
                      <span className="font-medium">{data.quoteNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">วันที่: </span>
                    <span className="font-medium">{today}</span>
                  </div>
                  {profile.ownerName && (
                    <div>
                      <span className="text-gray-400">ชื่อ: </span>
                      <span className="font-medium">{profile.ownerName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <div className="text-[10px] text-gray-500 mb-0.5">เรียน/สำหรับ</div>
              <div className="font-medium truncate">
                {data.customer.name || "—"}
              </div>
              {data.customer.phone && (
                <div className="text-gray-600 text-[11px] truncate">
                  โทร. {data.customer.phone}
                </div>
              )}
              {data.customer.email && (
                <div className="text-gray-600 text-[11px] truncate">
                  {data.customer.email}
                </div>
              )}
              {data.customer.address && (
                <div className="text-gray-600 text-[11px] mt-1 line-clamp-2">
                  {data.customer.address}
                </div>
              )}
            </div>
            <div className="text-right min-w-0">
              <div className="text-[10px] text-gray-500 mb-0.5">โครงการ</div>
              <div className="font-medium break-words">
                {data.projectName || "—"}
              </div>
              {data.startDate && (
                <div className="text-gray-600 text-[11px] mt-1">
                  {fmtDate(data.startDate)}
                  <br />— {fmtDate(data.endDate)}
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
                  data.services.map((s) => {
                    const qty = Math.max(1, s.quantity || 1);
                    const lineTotal = s.free ? 0 : s.price * qty;
                    return (
                      <tr key={s.id} className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 align-top">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="break-words">{s.name}</span>
                            {s.free ? (
                              <span className="text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded whitespace-nowrap">
                                ฟรี
                              </span>
                            ) : (
                              qty > 1 && (
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  @ {currencySymbol}
                                  {fmt(s.price)} × {qty}
                                </span>
                              )
                            )}
                          </div>
                          {s.description && (
                            <div className="text-[10px] text-gray-500 italic mt-0.5">
                              {s.description}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 text-right tabular-nums whitespace-nowrap align-top">
                          {s.free ? "—" : `${currencySymbol}${fmt(lineTotal)}`}
                        </td>
                      </tr>
                    );
                  })
                )}

                {calc.difficultyBreakdown.map((x, i) => (
                  <tr
                    key={`diff-${i}`}
                    className="border-b border-gray-100 text-gray-600"
                  >
                    <td className="py-1.5">{x.label}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {currencySymbol}
                      {fmt(x.amount)}
                    </td>
                  </tr>
                ))}
                {calc.extrasBreakdown.map((x, i) => (
                  <tr
                    key={`ex-${i}`}
                    className="border-b border-gray-100 text-gray-600"
                  >
                    <td className="py-1.5">{x.label}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {currencySymbol}
                      {fmt(x.amount)}
                    </td>
                  </tr>
                ))}
                {calc.hiddenCostNum > 0 && (
                  <tr className="border-b border-gray-100 text-gray-600">
                    <td className="py-1.5">ต้นทุนแฝง</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {currencySymbol}
                      {fmt(calc.hiddenCostNum)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="space-y-1 pt-1">
            <SummaryRow
              label="ยอดรวมก่อนภาษี"
              value={`${currencySymbol}${fmt(calc.preDiscount)}`}
            />
            {calc.discountValue > 0 && (
              <SummaryRow
                label={`ส่วนลด${
                  data.discountUnit === "percent" ? ` (${data.discount}%)` : ""
                }`}
                value={`−${currencySymbol}${fmt(calc.discountValue)}`}
                tone="discount"
              />
            )}
            {calc.discountValue > 0 && (
              <SummaryRow
                label="ยอดหลังหักส่วนลด"
                value={`${currencySymbol}${fmt(calc.afterDiscount)}`}
              />
            )}
            {data.vat7 && (
              <SummaryRow
                label="VAT 7%"
                value={`+${currencySymbol}${fmt(calc.vatAmount)}`}
              />
            )}
            {data.tax3Percent && (
              <SummaryRow
                label="หัก ณ ที่จ่าย 3%"
                value={`−${currencySymbol}${fmt(calc.taxDeduction)}`}
                tone="discount"
              />
            )}
          </section>

          <section className="space-y-1.5 pt-1 border-t border-gray-100">
            <Row
              label="รวมทั้งสิ้น"
              value={`${currencySymbol}${fmt(calc.total)}`}
              highlight
            />
            <Row
              label="มัดจำที่ต้องชำระ"
              value={`${currencySymbol}${fmt(calc.deposit)}`}
              highlight
            />
          </section>

          <section className="bg-orange-50 border-l-4 border-brand-500 px-3 py-2 rounded">
            <div className="text-[10px] text-gray-500 mb-0.5">เงื่อนไขการชำระ</div>
            <div className="text-[11px] font-medium">
              {data.paymentCondition} (มัดจำ {termLabel[data.paymentTerm]})
            </div>
          </section>

          {hasPayment && (
            <section className="border border-gray-200 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 mb-2 font-medium uppercase tracking-wide">
                ช่องทางการชำระเงิน
              </div>
              <div className="flex items-start gap-3">
                {pay.qrCode && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={pay.qrCode}
                    alt="Payment QR"
                    className="w-20 h-20 rounded border border-gray-200 object-contain bg-white shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-0.5 text-[11px]">
                  {pay.bankName && (
                    <div>
                      <span className="text-gray-500">ธนาคาร: </span>
                      <span className="font-medium text-gray-800">
                        {pay.bankName}
                      </span>
                    </div>
                  )}
                  {pay.accountName && (
                    <div>
                      <span className="text-gray-500">ชื่อบัญชี: </span>
                      <span className="font-medium text-gray-800">
                        {pay.accountName}
                      </span>
                    </div>
                  )}
                  {pay.accountNumber && (
                    <div>
                      <span className="text-gray-500">เลขบัญชี: </span>
                      <span className="font-bold text-brand-600 tracking-wider">
                        {pay.accountNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="flex items-end justify-between pt-6">
            <div className="min-w-0">
              <div className="text-[10px] text-gray-500">เตรียมโดย</div>
              <div className="font-semibold text-sm truncate">
                {profile.ownerName || profile.studioName}
              </div>
              {profile.socialLink && (
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-brand-600 truncate">
                  <Link2 size={10} />
                  <span className="truncate">
                    {profile.socialLink.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="border-b border-gray-400 w-24 sm:w-28 mb-1"></div>
              <div className="text-[10px] text-gray-500">ลงนาม</div>
            </div>
          </section>

          {termsLines.length > 0 && (
            <section className="pt-2 border-t border-gray-100">
              <div className="text-[10px] text-gray-500 mb-1">
                หมายเหตุและเงื่อนไข
              </div>
              <ul className="text-[10px] text-gray-600 space-y-0.5 list-disc list-inside">
                {termsLines.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-gray-100 text-[9px] text-gray-500">
            <span>Free to Create, Easy to Manage by</span>
            <div className="w-4 h-4 rounded bg-brand-500 text-white flex items-center justify-center font-bold text-[8px]">
              FS
            </div>
            <span className="font-semibold text-gray-700">FreelanceSolo</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-gray-100 no-print safe-bottom">
        <button
          onClick={onDownload}
          disabled={downloading}
          className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 text-white py-3 rounded-md font-medium flex items-center justify-center gap-2 transition"
        >
          {downloading ? (
            <>
              <FileText size={18} className="animate-pulse" />
              กำลังเตรียมเอกสาร...
            </>
          ) : (
            <>
              <Download size={18} /> บันทึกเป็น PDF
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "discount";
}) {
  return (
    <div className="flex justify-between items-center text-[11px] text-gray-600">
      <span>{label}</span>
      <span
        className={`tabular-nums ${tone === "discount" ? "text-green-600" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

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
      className={`flex justify-between items-center py-1.5 gap-2 ${
        highlight
          ? "bg-orange-50 px-3 rounded text-brand-600 font-semibold"
          : "text-gray-700"
      }`}
    >
      <span className="text-[11px]">{label}</span>
      <span className="text-sm tabular-nums whitespace-nowrap">{value}</span>
    </div>
  );
}
