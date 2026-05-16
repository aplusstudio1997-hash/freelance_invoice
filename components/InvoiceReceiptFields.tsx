"use client";

import { CalendarClock, Wallet, CheckCircle2 } from "lucide-react";
import { QuoteSettings, DocumentType, getCurrencySymbol } from "@/lib/types";
import DateInput from "./DateInput";

interface Props {
  type: DocumentType;
  data: QuoteSettings;
  update: (patch: Partial<QuoteSettings>) => void;
  currency: string;
}

const PAYMENT_METHODS = [
  "เงินสด",
  "โอนผ่านธนาคาร",
  "PromptPay / QR",
  "บัตรเครดิต",
  "เช็ค",
  "อื่นๆ",
];

export default function InvoiceReceiptFields({
  type,
  data,
  update,
  currency,
}: Props) {
  if (type === "quote") return null;

  const symbol = getCurrencySymbol(currency);

  return (
    <section>
      <div className="flex items-center gap-1.5 font-medium text-gray-700 mb-3 text-sm">
        {type === "invoice" ? (
          <>
            <CalendarClock size={15} className="text-brand-500" />
            ข้อมูลใบแจ้งหนี้
          </>
        ) : (
          <>
            <CheckCircle2 size={15} className="text-brand-500" />
            ข้อมูลใบเสร็จรับเงิน
          </>
        )}
      </div>

      {type === "invoice" && (
        <div className="w-full sm:w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">
            วันครบกำหนดชำระ
          </label>
          <DateInput
            value={data.dueDate || ""}
            onChange={(v) => update({ dueDate: v })}
          />
          <p className="text-xs text-gray-500 mt-1">
            วันที่ลูกค้าต้องชำระเงินภายใน
          </p>
        </div>
      )}

      {type === "receipt" && (
        <div className="flex flex-wrap gap-3">
          <div className="w-full sm:w-[180px]">
            <label className="block text-xs text-gray-500 mb-1">
              วันที่ได้รับเงิน
            </label>
            <DateInput
              value={data.paidDate || ""}
              onChange={(v) => update({ paidDate: v })}
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">
              วิธีการชำระเงิน
            </label>
            <select
              value={data.paymentMethod || ""}
              onChange={(e) => update({ paymentMethod: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 text-sm"
            >
              <option value="">— เลือก —</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-[160px]">
            <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Wallet size={12} />
              ยอดที่รับจริง ({symbol})
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={data.paidAmount ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (!raw) {
                  update({ paidAmount: undefined });
                  return;
                }
                const n = parseFloat(raw.replace(/,/g, ""));
                // reject NaN / negatives so paidAmount can never become NaN
                if (Number.isFinite(n) && n >= 0) update({ paidAmount: n });
              }}
              placeholder="ปล่อยว่าง = เต็ม"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 text-sm tabular-nums"
            />
          </div>
        </div>
      )}
    </section>
  );
}
