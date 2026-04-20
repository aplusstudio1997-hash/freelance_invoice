"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { QuoteSettings, DEFAULT_QUOTE } from "@/lib/types";
import { loadDraft, saveDraft, clearDraft } from "@/lib/storage";
import { calculate } from "@/lib/calc";
import SettingsPanel from "@/components/SettingsPanel";
import ServicesPanel from "@/components/ServicesPanel";
import TimelinePanel from "@/components/TimelinePanel";
import QuotePreview from "@/components/QuotePreview";
import RandomPromptModal from "@/components/RandomPromptModal";
import StressReliefModal from "@/components/StressReliefModal";
import { Dice5, Smile, RotateCcw, Save } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [hydrated, setHydrated] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [reliefOpen, setReliefOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");

  useEffect(() => {
    setData(loadDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus("saving");
    const t = setTimeout(() => {
      saveDraft(data);
      setSaveStatus("saved");
      const t2 = setTimeout(() => setSaveStatus(""), 1500);
      return () => clearTimeout(t2);
    }, 500);
    return () => clearTimeout(t);
  }, [data, hydrated]);

  const update = useCallback((patch: Partial<QuoteSettings>) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  const calc = useMemo(() => calculate(data), [data]);

  const resetAll = () => {
    if (confirm("ล้างข้อมูลทั้งหมดและเริ่มใหม่?")) {
      clearDraft();
      setData(DEFAULT_QUOTE);
    }
  };

  const downloadPDF = () => {
    setDownloading(true);
    saveDraft(data);
    setTimeout(() => {
      window.open("/print", "_blank");
      setDownloading(false);
    }, 250);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
            F
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-800 truncate">FreelanceSolo</h1>
              <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-semibold">
                BETA
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์อย่างง่าย
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Save size={12} />
              {saveStatus === "saving" ? "กำลังบันทึก..." : "บันทึกแล้ว"}
            </span>
          )}
          <button
            onClick={() => setPromptOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-full text-sm transition"
          >
            <Dice5 size={14} /> <span className="hidden sm:inline">สุ่มโจทย์</span>
          </button>
          <button
            onClick={() => setReliefOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-full text-sm transition"
          >
            <Smile size={14} /> <span className="hidden sm:inline">คลายเครียด</span>
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full text-sm transition"
            title="เริ่มใหม่"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        <SettingsPanel data={data} update={update} />
        <ServicesPanel data={data} update={update} />
        <TimelinePanel data={data} update={update} calc={calc} />
        <QuotePreview
          data={data}
          calc={calc}
          onDownload={downloadPDF}
          downloading={downloading}
        />
      </main>

      <RandomPromptModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
      />
      <StressReliefModal
        open={reliefOpen}
        onClose={() => setReliefOpen(false)}
      />
    </div>
  );
}
