"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { QuoteSettings, DEFAULT_QUOTE } from "@/lib/types";
import { loadDraft, saveDraft, clearDraft } from "@/lib/storage";
import { calculate, fmt } from "@/lib/calc";
import SettingsPanel from "@/components/SettingsPanel";
import ServicesPanel from "@/components/ServicesPanel";
import TimelinePanel from "@/components/TimelinePanel";
import QuotePreview from "@/components/QuotePreview";
import RandomPromptModal from "@/components/RandomPromptModal";
import StressReliefModal from "@/components/StressReliefModal";
import {
  Dice5,
  Smile,
  RotateCcw,
  Save,
  Settings,
  ListPlus,
  Calendar,
  FileText,
  Menu,
  X,
} from "lucide-react";

type Tab = "settings" | "services" | "timeline" | "preview";

export default function Home() {
  const [data, setData] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [hydrated, setHydrated] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [reliefOpen, setReliefOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const [mobileTab, setMobileTab] = useState<Tab>("settings");

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
      setMenuOpen(false);
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
    <div className="h-[100dvh] flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between no-print safe-top">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
            F
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-800 truncate text-sm sm:text-base">
                FreelanceSolo
              </h1>
              <span className="text-[9px] sm:text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-semibold">
                BETA
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              คำนวณราคาและทำใบเสนอราคาออนไลน์
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {saveStatus && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Save size={12} />
              {saveStatus === "saving" ? "กำลังบันทึก..." : "บันทึกแล้ว"}
            </span>
          )}
          <button
            onClick={() => setPromptOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-full text-sm transition"
          >
            <Dice5 size={14} /> สุ่มโจทย์
          </button>
          <button
            onClick={() => setReliefOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-full text-sm transition"
          >
            <Smile size={14} /> คลายเครียด
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full text-sm transition"
            title="เริ่มใหม่"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden p-2 text-gray-600 hover:text-brand-600"
          aria-label="เมนู"
        >
          <Menu size={22} />
        </button>
      </header>

      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl safe-top animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-700">เมนู</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 space-y-1">
              <MenuItem
                icon={<Dice5 size={18} />}
                label="สุ่มโจทย์ฝึกคิดราคา"
                onClick={() => {
                  setPromptOpen(true);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={<Smile size={18} />}
                label="คลายเครียด"
                onClick={() => {
                  setReliefOpen(true);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={<RotateCcw size={18} />}
                label="ล้างข้อมูลและเริ่มใหม่"
                onClick={resetAll}
                danger
              />
            </div>
            {saveStatus && (
              <div className="px-4 py-2 text-xs text-gray-400 flex items-center gap-1.5 border-t border-gray-100">
                <Save size={12} />
                {saveStatus === "saving" ? "กำลังบันทึก..." : "บันทึกแล้ว"}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden flex-col md:flex-row">
        <div
          className={`${mobileTab === "settings" ? "flex" : "hidden"} md:flex flex-1 md:flex-none min-h-0`}
        >
          <SettingsPanel data={data} update={update} />
        </div>
        <div
          className={`${mobileTab === "services" ? "flex" : "hidden"} md:flex flex-1 md:flex-none min-h-0`}
        >
          <ServicesPanel data={data} update={update} />
        </div>
        <div
          className={`${mobileTab === "timeline" ? "flex" : "hidden"} md:flex flex-1 md:flex-1 min-h-0`}
        >
          <TimelinePanel data={data} update={update} calc={calc} />
        </div>
        <div
          className={`${mobileTab === "preview" ? "flex" : "hidden"} md:flex flex-1 md:flex-none min-h-0`}
        >
          <QuotePreview
            data={data}
            calc={calc}
            onDownload={downloadPDF}
            downloading={downloading}
          />
        </div>
      </main>

      <nav className="md:hidden bg-white border-t border-gray-200 safe-bottom no-print">
        <div className="px-1.5 py-1 grid grid-cols-4 gap-0.5">
          <TabButton
            active={mobileTab === "settings"}
            onClick={() => setMobileTab("settings")}
            icon={<Settings size={19} />}
            label="ตั้งค่า"
          />
          <TabButton
            active={mobileTab === "services"}
            onClick={() => setMobileTab("services")}
            icon={<ListPlus size={19} />}
            label="บริการ"
            badge={data.services.length > 0 ? data.services.length : undefined}
          />
          <TabButton
            active={mobileTab === "timeline"}
            onClick={() => setMobileTab("timeline")}
            icon={<Calendar size={19} />}
            label="ไทม์ไลน์"
          />
          <TabButton
            active={mobileTab === "preview"}
            onClick={() => setMobileTab("preview")}
            icon={<FileText size={19} />}
            label={calc.total > 0 ? `฿${fmt(calc.total)}` : "ใบเสนอ"}
            highlight={calc.total > 0}
          />
        </div>
      </nav>

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

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center py-1.5 rounded-md transition ${
        active
          ? "text-brand-600 bg-brand-50"
          : "text-gray-500 active:bg-gray-100"
      }`}
    >
      {icon}
      <span
        className={`text-[10px] mt-0.5 ${highlight && !active ? "text-brand-600 font-semibold" : ""}`}
      >
        {label}
      </span>
      {badge !== undefined && (
        <span className="absolute top-0 right-3 bg-brand-500 text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-semibold">
          {badge}
        </span>
      )}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition ${
        danger
          ? "text-red-600 hover:bg-red-50 active:bg-red-100"
          : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
