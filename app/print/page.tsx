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

function sanitizeForFilename(s: string): string {
  return s
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFilename(data: QuoteSettings, profile: Profile): string {
  const project = sanitizeForFilename(data.projectName || "");
  const customer = sanitizeForFilename(data.customer?.name || "");
  const studio = sanitizeForFilename(profile.studioName || "");
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String((d.getFullYear() + 543) % 100).padStart(2, "0");
  const dateStr = `${dd}-${mm}-${yy}`;
  const parts = ["QT"];
  if (project) parts.push(project);
  if (customer) parts.push(customer);
  if (studio) parts.push(studio);
  parts.push(dateStr);
  return parts.join("_");
}

export default function PrintPage() {
  const [data, setData] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const [milestonesInline, setMilestonesInline] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pageBreaks, setPageBreaks] = useState<
    Record<string, number[]>
  >({});

  useEffect(() => {
    setData(loadDraft());
    setProfile(loadProfile());
    setReady(true);
  }, []);

  const downloadPdf = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const sourcePages = Array.from(
        document.querySelectorAll(".print-page")
      ) as HTMLElement[];
      if (!sourcePages.length) return;

      const MARGIN_MM = { top: 15, right: 15, bottom: 22, left: 15 };
      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM.left - MARGIN_MM.right;
      const CONTENT_H_MM = PAGE_H_MM - MARGIN_MM.top - MARGIN_MM.bottom;
      const MM_PER_PX = 25.4 / 96;
      const CONTENT_W_PX = CONTENT_W_MM / MM_PER_PX;

      const offscreen = document.createElement("div");
      offscreen.style.cssText = `
        position: fixed;
        left: -99999px;
        top: 0;
        width: ${CONTENT_W_PX}px;
        background: white;
        color: #1f2937;
      `;
      document.body.appendChild(offscreen);

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      });

      let firstPage = true;

      for (const src of sourcePages) {
        const clone = src.cloneNode(true) as HTMLElement;
        clone
          .querySelectorAll(".page-break-indicator,.page-watermark")
          .forEach((el) => el.remove());
        clone.style.cssText = `
          width: ${CONTENT_W_PX}px;
          padding: 0;
          margin: 0;
          background: white;
          box-shadow: none;
          min-height: 0;
          position: static;
        `;
        offscreen.innerHTML = "";
        offscreen.appendChild(clone);

        await new Promise((r) => setTimeout(r, 50));

        const canvas = await html2canvas(clone, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          allowTaint: true,
          imageTimeout: 0,
          windowWidth: CONTENT_W_PX,
        });

        const canvasW = canvas.width;
        const canvasH = canvas.height;
        const pxPerMm = canvasW / CONTENT_W_MM;
        const sliceHeightPx = Math.floor(CONTENT_H_MM * pxPerMm);

        let offsetPx = 0;
        while (offsetPx < canvasH) {
          const thisSlicePx = Math.min(sliceHeightPx, canvasH - offsetPx);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvasW;
          sliceCanvas.height = thisSlicePx;
          const ctx = sliceCanvas.getContext("2d");
          if (!ctx) break;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasW, thisSlicePx);
          ctx.drawImage(
            canvas,
            0,
            offsetPx,
            canvasW,
            thisSlicePx,
            0,
            0,
            canvasW,
            thisSlicePx
          );

          if (!firstPage) pdf.addPage();
          firstPage = false;

          const imgData = sliceCanvas.toDataURL("image/png");
          const sliceHeightMm = thisSlicePx / pxPerMm;
          pdf.addImage(
            imgData,
            "PNG",
            MARGIN_MM.left,
            MARGIN_MM.top,
            CONTENT_W_MM,
            sliceHeightMm,
            undefined,
            "FAST"
          );

          offsetPx += thisSlicePx;
        }
      }

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(107, 114, 128);
        const footerY = PAGE_H_MM - 10;
        const rightX = PAGE_W_MM - MARGIN_MM.right;
        pdf.text(
          "Free to Create, Easy to Manage by",
          rightX - 45,
          footerY,
          { align: "left" }
        );
        pdf.setFillColor(249, 115, 22);
        pdf.roundedRect(rightX - 18, footerY - 3, 4.5, 4.5, 0.7, 0.7, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6);
        pdf.text("SF", rightX - 15.75, footerY + 0.2, { align: "center" });
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(55, 65, 81);
        pdf.text("So1o Freelancer", rightX - 12, footerY, { align: "left" });
        pdf.setFont("helvetica", "normal");
      }

      const filename = buildFilename(data, profile) + ".pdf";
      pdf.save(filename);

      document.body.removeChild(offscreen);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("สร้าง PDF ไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      const pxPerMm = 96 / 25.4;
      const pageHeightPx = 297 * pxPerMm;

      const breaks: Record<string, number[]> = {};
      const pages = document.querySelectorAll(".print-page");
      pages.forEach((el, idx) => {
        const h = (el as HTMLElement).offsetHeight;
        if (h > pageHeightPx + 10) {
          const arr: number[] = [];
          let pos = pageHeightPx;
          while (pos < h - 10) {
            arr.push(pos);
            pos += pageHeightPx;
          }
          breaks[String(idx)] = arr;
        } else {
          breaks[String(idx)] = [];
        }
      });
      setPageBreaks(breaks);

      const mainPage = document.querySelector(
        ".print-page:not(.milestones-page)"
      ) as HTMLElement | null;
      if (mainPage) {
        const heightMm = mainPage.offsetHeight / pxPerMm;
        const usableHeight = 297 - 15 - 22;
        setMilestonesInline(heightMm > usableHeight + 5);
      }
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
    data.milestones
  );

  const termsLines = profile.terms
    .split("\n")
    .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean);

  const pay = profile.payment;
  const hasPayment =
    pay.qrCode || pay.bankName || pay.accountName || pay.accountNumber;

  const PreviewWatermark = ({
    top,
    pageHeightMm,
  }: {
    top: number;
    pageHeightMm: number;
  }) => (
    <div
      className="preview-page-watermark no-print"
      style={{
        position: "absolute",
        top: `${top}px`,
        height: `${pageHeightMm}mm`,
        right: `15mm`,
        left: 0,
        pointerEvents: "none",
      }}
    >
      <div className="preview-watermark-inner">
        <span>Free to Create, Easy to Manage by</span>
        <div className="watermark-logo">SF</div>
        <span className="font-semibold">So1o Freelancer</span>
      </div>
    </div>
  );

  const MilestonesBlock = ({ inline }: { inline: boolean }) => (
    <section className={inline ? "pt-4 mt-4 border-t border-gray-200" : "milestones-content"}>
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
                <span className="font-medium text-gray-800">{m.label}</span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {m.date ? fmtDate(m.date) : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  const hasMilestones =
    !!data.startDate && !!data.endDate && milestones.length > 0;

  return (
    <>
      <div className="print-footer-watermark">
        <span>Free to Create, Easy to Manage by</span>
        <div className="watermark-logo">SF</div>
        <span style={{ fontWeight: 600 }}>So1o Freelancer</span>
      </div>

      <div className="print-toolbar no-print">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between py-3 px-4">
          <div className="text-sm text-gray-600">
            {generating
              ? "กำลังสร้าง PDF... กรุณารอสักครู่"
              : "ตรวจสอบเอกสารก่อนดาวน์โหลด แล้วกดปุ่มด้านขวา"}
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadPdf}
              disabled={generating}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {generating ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF"}
            </button>
            <button
              onClick={() => window.print()}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-md text-sm"
              title="พิมพ์ผ่าน print dialog (สำรอง)"
            >
              พิมพ์
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

      <div className="print-page page-1">
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
                {profile.studioName || "So1o Freelancer"}
              </h1>
              <p className="text-xs text-gray-500">{profile.tagline}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-flex items-center justify-center bg-brand-500 text-white px-4 py-1.5 rounded font-semibold text-sm mb-2 leading-none" style={{ lineHeight: 1.4 }}>
              ใบเสนอราคา
            </div>
            <div className="text-xs text-gray-700 space-y-0.5">
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
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 mt-4 mb-3">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              จาก / From
            </div>
            <div className="font-semibold text-gray-800 mb-0.5">
              {profile.ownerName || profile.studioName || "—"}
            </div>
            {profile.phone && (
              <div className="text-xs text-gray-600">โทร. {profile.phone}</div>
            )}
            {profile.email && (
              <div className="text-xs text-gray-600">{profile.email}</div>
            )}
            {profile.address && (
              <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                {profile.address}
              </div>
            )}
            {profile.taxId && (
              <div className="text-xs text-gray-600 mt-1">
                เลขประจำตัว: {profile.taxId}
              </div>
            )}
            {profile.socialLink && (
              <div className="text-xs text-brand-600 mt-1">
                {profile.socialLink.replace(/^https?:\/\//, "")}
              </div>
            )}
          </div>
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
        </section>

        <section className="flex items-start justify-between gap-4 pt-3 pb-3 mb-3 border-t border-gray-100">
          <div className="min-w-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              โครงการ
            </div>
            <div className="font-semibold text-gray-800">
              {data.projectName || "—"}
            </div>
          </div>
          {data.startDate && (
            <div className="text-right shrink-0">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                ระยะเวลา
              </div>
              <div className="text-xs text-gray-700">
                {fmtDate(data.startDate)} — {fmtDate(data.endDate)}
              </div>
              {calc.workingDays > 0 && (
                <div className="text-[11px] text-gray-500">
                  รวม {calc.workingDays} วันทำงาน
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left py-1.5 font-medium">รายการ</th>
                <th className="text-right py-1.5 font-medium w-36">
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
                      <td className="py-1.5 align-top">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-medium">{s.name}</span>
                          {s.free ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              แถมฟรี
                            </span>
                          ) : (
                            qty > 1 && (
                              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                @ {currencySymbol}
                                {fmt(s.price)} × {qty}
                              </span>
                            )
                          )}
                        </div>
                        {s.description && (
                          <div className="text-[11px] text-gray-500 italic mt-0.5">
                            {s.description}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 text-right tabular-nums align-top whitespace-nowrap">
                        {s.free ? "—" : fmt(lineTotal)}
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
                  <td className="py-1.5 text-sm">{x.label}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {fmt(x.amount)}
                  </td>
                </tr>
              ))}
              {calc.extrasBreakdown.map((x, i) => (
                <tr
                  key={`ex-${i}`}
                  className="border-b border-gray-100 text-gray-600"
                >
                  <td className="py-1.5 text-sm">{x.label}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {fmt(x.amount)}
                  </td>
                </tr>
              ))}
              {calc.hiddenCostNum > 0 && (
                <tr className="border-b border-gray-100 text-gray-600">
                  <td className="py-1.5 text-sm">ต้นทุนแฝงอื่นๆ</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {fmt(calc.hiddenCostNum)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="mb-4 ml-auto w-80 space-y-1 text-sm">
          <SummaryLine
            label="ยอดรวมก่อนภาษี"
            value={`${currencySymbol}${fmt(calc.preDiscount)}`}
          />
          {calc.discountValue > 0 && (
            <SummaryLine
              label={`ส่วนลด${
                data.discountUnit === "percent" ? ` (${data.discount}%)` : ""
              }`}
              value={`−${currencySymbol}${fmt(calc.discountValue)}`}
              discount
            />
          )}
          {calc.discountValue > 0 && (
            <SummaryLine
              label="ยอดหลังหักส่วนลด"
              value={`${currencySymbol}${fmt(calc.afterDiscount)}`}
            />
          )}
          {data.vat7 && (
            <SummaryLine
              label="VAT 7%"
              value={`+${currencySymbol}${fmt(calc.vatAmount)}`}
            />
          )}
          {data.tax3Percent && (
            <SummaryLine
              label="หัก ณ ที่จ่าย 3%"
              value={`−${currencySymbol}${fmt(calc.taxDeduction)}`}
              discount
            />
          )}
          <div className="flex justify-between py-2 px-3 mt-1.5 bg-orange-50 rounded text-brand-600 font-semibold">
            <span>รวมทั้งสิ้น</span>
            <span className="tabular-nums">
              {currencySymbol}
              {fmt(calc.total)}
            </span>
          </div>
          <div className="flex justify-between py-2 px-3 bg-orange-50 rounded text-brand-600 font-semibold">
            <span>มัดจำที่ต้องชำระ</span>
            <span className="tabular-nums">
              {currencySymbol}
              {fmt(calc.deposit)}
            </span>
          </div>
        </section>

        <section className="bg-orange-50 border-l-4 border-brand-500 px-3 py-2 rounded mb-4">
          <div className="text-[10px] text-gray-500 mb-0.5">เงื่อนไขการชำระ</div>
          <div className="text-xs font-medium text-gray-800">
            {data.paymentCondition} (มัดจำ {termLabel[data.paymentTerm]})
          </div>
        </section>

        {hasPayment && (
          <section className="border border-gray-200 rounded-lg p-3 mb-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
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

        <section className="flex items-end justify-between mt-8 mb-4">
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">เตรียมโดย</div>
            <div className="font-semibold text-gray-800 text-sm">
              {profile.ownerName || profile.studioName}
            </div>
            {profile.taxId && (
              <div className="text-[10px] text-gray-500 mt-0.5">
                เลขประจำตัว: {profile.taxId}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="border-b border-gray-400 w-48 mb-1"></div>
            <div className="text-[10px] text-gray-500">ลงนามผู้เสนอราคา</div>
          </div>
        </section>

        {termsLines.length > 0 && (
          <section className="pt-3 border-t border-gray-200">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">
              หมายเหตุและเงื่อนไข
            </div>
            <ul className="text-[11px] text-gray-600 space-y-0.5 list-disc list-inside leading-relaxed">
              {termsLines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
              <li>ราคานี้มีผลภายใน 30 วันนับจากวันที่เสนอ</li>
            </ul>
          </section>
        )}

        {hasMilestones && milestonesInline && <MilestonesBlock inline />}

        {(() => {
          const breaks = pageBreaks["0"] || [];
          const pageCount = breaks.length + 1;
          const items: JSX.Element[] = [];
          for (let i = 0; i < pageCount; i++) {
            const top = i === 0 ? 0 : breaks[i - 1];
            items.push(
              <PreviewWatermark
                key={`wm-${i}`}
                top={top}
                pageHeightMm={297}
              />
            );
          }
          breaks.forEach((y, i) => {
            items.push(
              <div
                key={`br-${i}`}
                className="page-break-indicator no-print"
                data-label={`— ขอบหน้า ${i + 1} / ${i + 2} —`}
                style={{ top: `${y}px` }}
              />
            );
          });
          return items;
        })()}
      </div>

      {hasMilestones && !milestonesInline && (
        <div className="print-page milestones-page">
          <MilestonesBlock inline={false} />
          {(() => {
            const breaks = pageBreaks["1"] || [];
            const pageCount = breaks.length + 1;
            const items: JSX.Element[] = [];
            for (let i = 0; i < pageCount; i++) {
              const top = i === 0 ? 0 : breaks[i - 1];
              items.push(
                <PreviewWatermark
                  key={`wm-${i}`}
                  top={top}
                  pageHeightMm={297}
                />
              );
            }
            breaks.forEach((y, i) => {
              items.push(
                <div
                  key={`br-${i}`}
                  className="page-break-indicator no-print"
                  data-label={`— ขอบหน้า —`}
                  style={{ top: `${y}px` }}
                />
              );
            });
            return items;
          })()}
        </div>
      )}

      <style jsx global>{`
        body {
          background: #e5e7eb;
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
          padding: 15mm 15mm 22mm 15mm;
          margin: 20px auto;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          color: #1f2937;
          position: relative;
          box-sizing: border-box;
          min-height: 297mm;
        }
        .page-break-indicator {
          position: absolute;
          left: -30px;
          right: -30px;
          height: 0;
          border-top: 1px dashed #94a3b8;
          pointer-events: none;
          z-index: 1;
        }
        .page-break-indicator::before {
          content: attr(data-label);
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #e5e7eb;
          padding: 2px 12px;
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
          border-radius: 10px;
          white-space: nowrap;
        }
        .print-page section {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .print-page table {
          page-break-inside: auto;
          break-inside: auto;
        }
        .print-page thead {
          display: table-header-group;
        }
        .print-page tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .preview-page-watermark {
          pointer-events: none;
        }
        .preview-watermark-inner {
          position: absolute;
          right: 0;
          bottom: 8mm;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          color: #6b7280;
        }
        .watermark-logo {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          background: #f97316;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 8px;
        }
        @media print {
          html, body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .print-toolbar {
            display: none !important;
          }
          .print-page {
            margin: 0;
            padding: 0 15mm;
            box-shadow: none;
            width: auto;
            min-height: auto;
            background: transparent;
          }
          .milestones-page {
            page-break-before: always !important;
            break-before: page !important;
            display: flex !important;
            flex-direction: column;
            justify-content: flex-end;
          }
          .milestones-page .milestones-content {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            size: A4;
            margin: 15mm 0 20mm 0;
          }
        }
      `}</style>
    </>
  );
}

function SummaryLine({
  label,
  value,
  discount,
}: {
  label: string;
  value: string;
  discount?: boolean;
}) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-200 text-gray-700">
      <span>{label}</span>
      <span className={`tabular-nums ${discount ? "text-green-600" : ""}`}>
        {value}
      </span>
    </div>
  );
}
