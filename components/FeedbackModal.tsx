"use client";

import { MessageSquare, Send, X, Coffee } from "lucide-react";
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

  if (!open) return null;

  const send = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      alert("กรุณากรอกข้อเสนอแนะ");
      return;
    }
    const subject = encodeURIComponent("FreelanceSolo — Feedback");
    const bodyLines = [
      trimmed,
      "",
      "---",
      email.trim() ? `From: ${email.trim()}` : "From: (ไม่ระบุอีเมล)",
      `Sent: ${new Date().toLocaleString("th-TH")}`,
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:wongchapat.james@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setMessage("");
      setEmail("");
      onClose();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-brand-600">
            <MessageSquare size={20} />
            <h3 className="font-semibold text-lg">ส่งข้อเสนอแนะ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
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
              rows={5}
              placeholder="อยากเห็นฟีเจอร์อะไรเพิ่ม? พบบั๊กมั้ย? อยากชม?"
              className="w-full border border-brand-200 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
            />
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
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
          className="w-full mt-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-3 rounded-md font-medium flex items-center justify-center gap-2 transition"
        >
          <Send size={16} /> ส่งข้อเสนอแนะ
        </button>
      </div>
    </div>
  );
}
