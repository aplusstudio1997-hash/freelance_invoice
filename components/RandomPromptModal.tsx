"use client";

import { PROMPT_CATEGORIES, CHAOS_CONDITIONS } from "@/lib/prompts";
import {
  Lightbulb,
  RefreshCw,
  X,
  Copy,
  Share2,
  Zap,
  Timer,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenShare: () => void;
}

export default function RandomPromptModal({
  open,
  onClose,
  onOpenShare,
}: Props) {
  const [category, setCategory] = useState<string>("logo");
  const [promptIdx, setPromptIdx] = useState(0);
  const [chaosList, setChaosList] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const [timerOn, setTimerOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timerOn) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [timerOn]);

  useEffect(() => {
    if (!open) {
      setTimerOn(false);
      setElapsed(0);
      setChaosList([]);
    }
  }, [open]);

  if (!open) return null;

  const catData = PROMPT_CATEGORIES[category];
  const prompt = catData.prompts[promptIdx % catData.prompts.length];

  const randomize = () => {
    const next =
      catData.prompts.length > 1
        ? (promptIdx + 1 + Math.floor(Math.random() * (catData.prompts.length - 1))) %
          catData.prompts.length
        : 0;
    setPromptIdx(next);
    setChaosList([]);
  };

  const addChaos = () => {
    const available = CHAOS_CONDITIONS.map((_, i) => i).filter(
      (i) => !chaosList.includes(i)
    );
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    setChaosList([...chaosList, pick]);
  };

  const buildText = () => {
    const lines = [
      `🎨 โจทย์ออกแบบ (${catData.label})`,
      ``,
      `🏢 ธุรกิจ: ${prompt.business}`,
      `🎨 ออกแบบ: ${prompt.design}`,
      `✏️ สไตล์: ${prompt.style}`,
      `👥 กลุ่มเป้าหมาย: ${prompt.target}`,
      `💬 Slogan: ${prompt.slogan}`,
    ];
    if (chaosList.length > 0) {
      lines.push(``, `⚡ CHAOS MOD:`);
      chaosList.forEach((i) => {
        const c = CHAOS_CONDITIONS[i];
        lines.push(`${c.icon} ${c.text}`);
      });
    }
    lines.push(``, `— จาก So1o Freelancer`);
    return lines.join("\n");
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("textarea");
      input.value = buildText();
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 animate-fadeIn shadow-xl my-auto"
              >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-brand-600">
            <Lightbulb size={20} className="fill-yellow-300 text-yellow-500" />
            <h3 className="font-semibold text-lg">สุ่มโจทย์ออกแบบ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            หมวดหมู่งาน
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPromptIdx(0);
              setChaosList([]);
            }}
            className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {Object.entries(PROMPT_CATEGORIES).map(([key, c]) => (
              <option key={key} value={key}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <button
            onClick={() => setTimerOn((t) => !t)}
            className={`flex items-center gap-2 w-full border rounded-md px-3 py-2.5 text-sm transition ${
              timerOn
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Timer size={16} />
            <span>
              {timerOn
                ? `กำลังจับเวลา · ${fmtTime(elapsed)}`
                : "จับเวลาการออกแบบ"}
            </span>
            {timerOn && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setElapsed(0);
                }}
                className="ml-auto text-xs text-gray-500 hover:text-gray-700 underline"
              >
                รีเซ็ต
              </span>
            )}
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 text-sm space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin">
          <div className="text-xs text-gray-500 font-medium mb-1">โจทย์</div>
          <PromptLine icon="🏢" label="ธุรกิจ" value={prompt.business} />
          <PromptLine icon="🎨" label="ออกแบบ" value={prompt.design} />
          <PromptLine icon="✏️" label="สไตล์" value={prompt.style} />
          <PromptLine icon="👥" label="กลุ่มเป้าหมาย" value={prompt.target} />
          <PromptLine icon="💬" label="Slogan" value={prompt.slogan} />
          {chaosList.length > 0 && (
            <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
              {chaosList.map((i) => {
                const c = CHAOS_CONDITIONS[i];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-[13px] text-purple-700 animate-fadeIn"
                  >
                    <Zap size={13} className="mt-0.5 shrink-0 text-purple-500" />
                    <span className="font-semibold">CHAOS MOD:</span>
                    <span>
                      {c.icon} {c.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={randomize}
            className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-1.5 transition"
          >
            <RefreshCw size={15} /> สุ่มใหม่
          </button>
          <button
            onClick={addChaos}
            disabled={chaosList.length >= CHAOS_CONDITIONS.length}
            className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:bg-purple-200 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-1.5 transition"
          >
            <Zap size={15} /> Chaos Mod
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyPrompt}
            className="border border-gray-200 hover:bg-gray-50 active:bg-gray-100 py-2.5 rounded-md font-medium flex items-center justify-center gap-1.5 transition text-gray-700"
          >
            {copied ? (
              <>
                <Check size={15} className="text-green-500" />
                คัดลอกแล้ว
              </>
            ) : (
              <>
                <Copy size={15} /> คัดลอก
              </>
            )}
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenShare();
            }}
            className="border border-brand-200 text-brand-600 hover:bg-brand-50 py-2.5 rounded-md font-medium flex items-center justify-center gap-1.5 transition"
          >
            <Share2 size={15} /> แชร์
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptLine({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0">{icon}</span>
      <span>
        <span className="text-gray-500">{label}:</span>{" "}
        <span className="text-gray-800">{value}</span>
      </span>
    </div>
  );
}
