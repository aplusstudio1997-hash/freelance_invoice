"use client";

import { useEffect, useState } from "react";
import { X, Target, Loader2 } from "lucide-react";
import { upsertGoal } from "@/lib/finance";
import { THAI_MONTHS } from "@/lib/finance-utils";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  open: boolean;
  year: number;
  month: number;
  currentAmount?: number;
  currency?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function GoalModal({
  open,
  year,
  month,
  currentAmount,
  currency = "THB",
  onClose,
  onSaved,
}: Props) {
  const [str, setStr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onBackdropClick } = useModalDismiss(onClose, { open });

  useEffect(() => {
    if (open) {
      setStr(currentAmount ? String(currentAmount) : "");
      setError(null);
    }
  }, [open, currentAmount]);

  if (!open) return null;

  const submit = async () => {
    const n = parseFloat(str);
    if (!Number.isFinite(n) || n < 0) {
      setError("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await upsertGoal(year, month, n, currency);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-sm shadow-soft-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-500 flex items-center justify-center">
              <Target size={15} />
            </div>
            <h3 className="font-semibold text-ink-900">ตั้งเป้ารายได้</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="text-xs text-ink-400">
            เป้ารายได้สำหรับ
          </div>
          <div className="text-lg font-bold text-ink-900">
            {THAI_MONTHS[month - 1]} {year + 543}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1.5">
              จำนวนเงิน (THB)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={str}
              onChange={(e) => setStr(e.target.value)}
              placeholder="เช่น 80000"
              className="w-full px-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition tabular-nums"
            />
          </div>

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-orange-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-orange-200 text-ink-700 hover:bg-orange-50 text-sm font-medium transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 disabled:bg-ink-400 text-white text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            บันทึกเป้า
          </button>
        </div>
      </div>
    </div>
  );
}
