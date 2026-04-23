"use client";

import { sendFeedback } from "@/lib/api";
import { MessageSquare, Send, X, Coffee, Star, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenDonation: () => void;
}

export default function FeedbackModal({
  open,
  onClose,
  onOpenDonation,
}: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const close = () => {
    setMessage("");
    setEmail("");
    setRating(0);
    setSent(false);
    setSending(false);
    onClose();
  };

  const send = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      alert("กรุณากรอกข้อเสนอแนะ");
      return;
    }
    setSending(true);
    try {
      await sendFeedback({
        email: email.trim(),
        rating,
        message: trimmed,
      });
      setSent(true);
      setTimeout(close, 1500);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      setSending(false);
    }
  };

  const ratingLabel: Record<number, string> = {
    1: "แย่มาก",
    2: "ไม่ค่อยดี",
    3: "พอใช้",
    4: "ดี",
    5: "ยอดเยี่ยม!",
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={sending ? undefined : close}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn shadow-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-brand-600">
            <MessageSquare size={20} />
            <h3 className="font-semibold text-lg">ส่งข้อเสนอแนะ</h3>
          </div>
          <button
            onClick={close}
            disabled={sending}
            className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check size={32} className="text-green-600" strokeWidth={3} />
            </div>
            <div className="font-semibold text-gray-800 text-lg mb-1">
              ขอบคุณสำหรับข้อเสนอแนะ!
            </div>
            <div className="text-sm text-gray-500">เราจะนำไปปรับปรุงต่อไป</div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="bg-orange-50/60 border border-orange-100 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 mb-2">
                  ให้คะแนน FreelanceSolo
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = (hover || rating) >= n;
                    return (
                      <button
                        key={n}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(n)}
                        className="p-1 transition hover:scale-110"
                        aria-label={`${n} ดาว`}
                      >
                        <Star
                          size={30}
                          className={
                            filled
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-brand-600 font-medium h-4">
                  {hover
                    ? ratingLabel[hover]
                    : rating
                    ? ratingLabel[rating]
                    : "\u00a0"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  EMAIL (ไม่จำเป็น)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ข้อเสนอแนะ
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="อยากเห็นฟีเจอร์อะไรเพิ่ม? พบบั๊กมั้ย? อยากชม?"
                  className="w-full border border-brand-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                close();
                onOpenDonation();
              }}
              className="w-full mt-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm py-2.5 rounded-md flex items-center justify-center gap-2 transition"
            >
              <Coffee size={14} className="text-brand-500" />
              สนับสนุนค่ากาแฟ:{" "}
              <span className="font-semibold text-gray-800">PromptPay</span>
            </button>

            <button
              onClick={send}
              disabled={sending}
              className="w-full mt-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 text-white py-3 rounded-md font-medium flex items-center justify-center gap-2 transition"
            >
              {sending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send size={16} /> ส่งข้อเสนอแนะ
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
