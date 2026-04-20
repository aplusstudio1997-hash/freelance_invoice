"use client";

import { RANDOM_PROMPTS } from "@/lib/prompts";
import { Dice5, RefreshCw, X } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RandomPromptModal({ open, onClose }: Props) {
  const [idx, setIdx] = useState(() =>
    Math.floor(Math.random() * RANDOM_PROMPTS.length)
  );

  const randomize = () => {
    let next = idx;
    while (next === idx && RANDOM_PROMPTS.length > 1) {
      next = Math.floor(Math.random() * RANDOM_PROMPTS.length);
    }
    setIdx(next);
  };

  if (!open) return null;
  const prompt = RANDOM_PROMPTS[idx];

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
            <Dice5 size={20} />
            <h3 className="font-semibold text-lg">สุ่มโจทย์ฝึกคิดราคา</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-4">
          <div className="text-xs text-brand-600 font-semibold mb-1">โจทย์</div>
          <h4 className="font-medium text-gray-800 mb-2">{prompt.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{prompt.brief}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={randomize}
            className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition"
          >
            <RefreshCw size={16} /> สุ่มใหม่
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
          >
            ปิด
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          ลองคิดราคาของคุณแล้วเปรียบเทียบกับตลาด · ไม่มีคำตอบถูกผิด
        </p>
      </div>
    </div>
  );
}
