"use client";

import { X, Facebook, Send, Link2, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShareModal({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const url =
    typeof window !== "undefined" ? window.location.origin : "";
  const text = "FreelanceSolo — เครื่องมือคำนวณราคาและทำใบเสนอราคาฟรีสำหรับฟรีแลนซ์";

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "width=600,height=500");
  };

  const shareLine = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + " " + url)}`;
    window.open(lineUrl, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full p-6 animate-fadeIn shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">แชร์กับเพื่อน</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={shareFacebook}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
          >
            <Facebook size={20} className="text-[#1877F2]" />
            <span className="font-medium text-gray-700">แชร์บน Facebook</span>
          </button>

          <button
            onClick={shareLine}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
          >
            <Send size={20} className="text-[#06C755]" />
            <span className="font-medium text-gray-700">ส่งไปยัง Line</span>
          </button>

          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
          >
            {copied ? (
              <>
                <Check size={20} className="text-green-500" />
                <span className="font-medium text-green-600">คัดลอกแล้ว!</span>
              </>
            ) : (
              <>
                <Link2 size={20} className="text-brand-500" />
                <span className="font-medium text-gray-700">คัดลอกลิงก์</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
