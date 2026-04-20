"use client";

import { STRESS_QUOTES, STRESS_GAMES } from "@/lib/prompts";
import { Heart, Play, Pause, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "quote" | "breath";

export default function StressReliefModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("quote");
  const [quoteIdx, setQuoteIdx] = useState(() =>
    Math.floor(Math.random() * STRESS_QUOTES.length)
  );

  if (!open) return null;

  const nextQuote = () => {
    let n = quoteIdx;
    while (n === quoteIdx && STRESS_QUOTES.length > 1) {
      n = Math.floor(Math.random() * STRESS_QUOTES.length);
    }
    setQuoteIdx(n);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 animate-fadeIn shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-brand-600">
            <Heart size={20} />
            <h3 className="font-semibold text-lg">คลายเครียด</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-md mb-4">
          <TabBtn active={tab === "quote"} onClick={() => setTab("quote")}>
            คำคมฟรีแลนซ์
          </TabBtn>
          <TabBtn active={tab === "breath"} onClick={() => setTab("breath")}>
            หายใจ 4-7-8
          </TabBtn>
        </div>

        {tab === "quote" && (
          <div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 mb-4 min-h-[140px] flex items-center justify-center">
              <blockquote className="text-center text-gray-800 leading-relaxed italic">
                &ldquo;{STRESS_QUOTES[quoteIdx]}&rdquo;
              </blockquote>
            </div>
            <button
              onClick={nextQuote}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition"
            >
              <RefreshCw size={16} /> คำคมถัดไป
            </button>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                เทคนิคเพิ่มเติม
              </h4>
              <div className="space-y-2">
                {STRESS_GAMES.map((g) => (
                  <div
                    key={g.name}
                    className="bg-gray-50 rounded-md p-3 text-sm"
                  >
                    <div className="font-medium text-brand-600">{g.name}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "breath" && <BreathExercise />}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm rounded font-medium transition ${
        active ? "bg-white shadow-sm text-brand-600" : "text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

function BreathExercise() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "rest">("rest");
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }

    if (count > 0) {
      timerRef.current = window.setTimeout(() => setCount((c) => c - 1), 1000);
    } else {
      if (phase === "rest" || phase === "out") {
        setPhase("in");
        setCount(4);
        if (phase === "out") {
          setCycle((c) => {
            const next = c + 1;
            if (next >= 4) {
              setRunning(false);
              return 0;
            }
            return next;
          });
        }
      } else if (phase === "in") {
        setPhase("hold");
        setCount(7);
      } else if (phase === "hold") {
        setPhase("out");
        setCount(8);
      }
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [running, count, phase]);

  const toggle = () => {
    if (!running) {
      setPhase("in");
      setCount(4);
      setCycle(0);
    }
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    setPhase("rest");
    setCount(4);
    setCycle(0);
  };

  const label =
    phase === "in"
      ? "หายใจเข้า"
      : phase === "hold"
      ? "กลั้น"
      : phase === "out"
      ? "หายใจออก"
      : "พร้อม?";

  const scale =
    phase === "in" ? "scale-110" : phase === "out" ? "scale-75" : "scale-100";

  return (
    <div className="text-center">
      <div className="relative h-48 flex items-center justify-center mb-4">
        <div
          className={`w-32 h-32 bg-gradient-to-br from-brand-300 to-brand-500 rounded-full transition-transform duration-1000 ease-in-out ${scale} flex items-center justify-center shadow-lg`}
        >
          <div className="text-white">
            <div className="text-3xl font-bold">{running ? count : "—"}</div>
            <div className="text-xs">{label}</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        รอบที่ {cycle + 1} / 4 · ช่วยลดคอร์ติซอลและสงบประสาท
      </p>

      <div className="flex gap-2">
        <button
          onClick={toggle}
          className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition"
        >
          {running ? (
            <>
              <Pause size={16} /> หยุด
            </>
          ) : (
            <>
              <Play size={16} /> เริ่ม
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
        >
          รีเซ็ต
        </button>
      </div>
    </div>
  );
}
