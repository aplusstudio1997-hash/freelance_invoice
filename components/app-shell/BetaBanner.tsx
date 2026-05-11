"use client";

import { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";

const STORAGE_KEY = "so1o-banner-dismissed-v1";

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="px-3 sm:px-6 pt-3 sm:pt-4">
      <div className="relative rounded-3xl overflow-hidden border border-orange-200/60 shadow-soft bg-gradient-to-r from-peach-100 via-peach-200 to-brand-300">
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-300/40 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-peach-300/50 rounded-full blur-3xl" />
        </div>

        <div className="relative flex items-center gap-4 sm:gap-6 p-4 sm:p-5">
          <div className="hidden sm:flex w-11 h-11 rounded-full bg-white/80 backdrop-blur items-center justify-center shadow-soft shrink-0">
            <Megaphone size={18} className="text-brand-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-4xl font-bold text-ink-900 leading-tight italic">
              Freelancer
            </div>
            <div className="hidden sm:block w-12 h-0.5 bg-brand-500 my-1.5 rounded-full" />
            <div className="text-sm sm:text-base text-ink-700 font-medium">
              Freelance Online Management
            </div>
          </div>

          <div className="hidden md:block shrink-0">
            <div className="bg-white/60 backdrop-blur px-4 py-2 rounded-full text-xs text-ink-700 font-medium">
              ✨ ครบในที่เดียวสำหรับฟรีแลนซ์
            </div>
          </div>

          <button
            onClick={close}
            className="shrink-0 w-8 h-8 rounded-full bg-white/60 hover:bg-white text-ink-600 flex items-center justify-center transition"
            aria-label="ปิด"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
