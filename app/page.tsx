"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  QuoteSettings,
  DEFAULT_QUOTE,
  Profile,
  DEFAULT_PROFILE,
  getCurrencySymbol,
} from "@/lib/types";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  loadProfile,
  saveProfile,
} from "@/lib/storage";
import { calculate, fmt } from "@/lib/calc";
import { sendQuote } from "@/lib/api";
import SettingsPanel from "@/components/SettingsPanel";
import ServicesPanel from "@/components/ServicesPanel";
import TimelinePanel from "@/components/TimelinePanel";
import QuotePreview from "@/components/QuotePreview";
import RandomPromptModal from "@/components/RandomPromptModal";
import StressReliefModal from "@/components/StressReliefModal";
import FeedbackModal from "@/components/FeedbackModal";
import DonationModal from "@/components/DonationModal";
import ShareModal from "@/components/ShareModal";
import ProfileModal from "@/components/ProfileModal";
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
  MessageSquare,
  Heart,
  Share2,
  UserCog,
} from "lucide-react";

type Tab = "settings" | "services" | "timeline" | "preview";

export default function Home() {
  const [data, setData] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  const [promptOpen, setPromptOpen] = useState(false);
  const [reliefOpen, setReliefOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const [mobileTab, setMobileTab] = useState<Tab>("settings");

  useEffect(() => {
    setData(loadDraft());
    setProfile(loadProfile());
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

  const updateProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
  };

  const calc = useMemo(() => calculate(data), [data]);
  const currencySymbol = getCurrencySymbol(profile.currency);

  const resetAll = () => {
    if (confirm("ล้างข้อมูลทั้งหมดและเริ่มใหม่?")) {
      clearDraft();
      setData(DEFAULT_QUOTE);
      setMenuOpen(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    saveDraft(data);
    saveProfile(profile);
    try {
      await sendQuote(data, calc, profile);
    } catch (e) {
      console.error("sendQuote failed", e);
    }
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
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between no-print safe-top gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
            {profile.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.logo}
                alt="logo"
                className="w-full h-full object-cover"
              />
            ) : (
              (profile.studioName || "F").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-800 truncate text-sm sm:text-base">
                {profile.studioName || "FreelanceSolo"}
              </h1>
              <span className="text-[9px] sm:text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-semibold">
                BETA
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              {profile.tagline || "คำนวณราคาและทำใบเสนอราคาออนไลน์"}
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
          {saveStatus && (
            <span className="flex items-center gap-1 text-xs text-gray-400 mr-1">
              <Save size={12} />
              {saveStatus === "saving" ? "กำลังบันทึก..." : "บันทึกแล้ว"}
            </span>
          )}
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full text-sm transition"
            title="ล้างข้อมูลทั้งหมด"
          >
            <RotateCcw size={14} />
            <span className="hidden xl:inline">Reset All</span>
          </button>
          <HeaderBtn
            icon={<Dice5 size={14} />}
            label="สุ่มโจทย์"
            onClick={() => setPromptOpen(true)}
          />
          <HeaderBtn
            icon={<Smile size={14} />}
            label="คลายเครียด"
            onClick={() => setReliefOpen(true)}
          />
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <HeaderBtn
            icon={<MessageSquare size={14} />}
            label="Feedback"
            onClick={() => setFeedbackOpen(true)}
          />
          <HeaderBtn
            icon={<Heart size={14} />}
            label="Donation"
            onClick={() => setDonationOpen(true)}
          />
          <HeaderBtn
            icon={<Share2 size={14} />}
            label="Share"
            onClick={() => setShareOpen(true)}
          />
          <HeaderBtn
            icon={<UserCog size={14} />}
            label="ตั้งค่าส่วนตัว"
            onClick={() => setProfileOpen(true)}
          />
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden p-2 text-gray-600 hover:text-brand-600"
          aria-label="เมนู"
        >
          <Menu size={22} />
        </button>
      </header>

      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl safe-top animate-fadeIn overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
              <span className="font-semibold text-gray-700">เมนู</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 space-y-0.5">
              <MenuItem
                icon={<UserCog size={18} />}
                label="ตั้งค่าส่วนตัว"
                onClick={() => {
                  setProfileOpen(true);
                  setMenuOpen(false);
                }}
              />
              <div className="h-px bg-gray-100 my-1.5" />
              <MenuItem
                icon={<RotateCcw size={18} />}
                label="Reset All — ล้างข้อมูลและเริ่มใหม่"
                onClick={resetAll}
                danger
              />
              <MenuItem
                icon={<Dice5 size={18} />}
                label="สุ่มโจทย์ออกแบบ"
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
              <div className="h-px bg-gray-100 my-1.5" />
              <MenuItem
                icon={<MessageSquare size={18} />}
                label="ส่งข้อเสนอแนะ (Feedback)"
                onClick={() => {
                  setFeedbackOpen(true);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={<Heart size={18} />}
                label="สนับสนุน (Donation)"
                onClick={() => {
                  setDonationOpen(true);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={<Share2 size={18} />}
                label="แชร์ (Share)"
                onClick={() => {
                  setShareOpen(true);
                  setMenuOpen(false);
                }}
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

      <main className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        <div
          className={`${mobileTab === "settings" ? "flex" : "hidden"} lg:flex flex-1 lg:flex-none min-h-0`}
        >
          <SettingsPanel
            data={data}
            update={update}
            currencySymbol={currencySymbol}
          />
        </div>
        <div
          className={`${mobileTab === "services" ? "flex" : "hidden"} lg:flex flex-1 lg:flex-none min-h-0`}
        >
          <ServicesPanel
            data={data}
            update={update}
            currencySymbol={currencySymbol}
            calc={calc}
          />
        </div>
        <div
          className={`${mobileTab === "timeline" ? "flex" : "hidden"} lg:flex flex-1 lg:flex-1 min-h-0`}
        >
          <TimelinePanel
            data={data}
            update={update}
            calc={calc}
            currencySymbol={currencySymbol}
          />
        </div>
        <div
          className={`${mobileTab === "preview" ? "flex" : "hidden"} lg:flex flex-1 lg:flex-none min-h-0`}
        >
          <QuotePreview
            data={data}
            calc={calc}
            profile={profile}
            currencySymbol={currencySymbol}
            onDownload={downloadPDF}
            downloading={downloading}
          />
        </div>
      </main>

      <nav className="lg:hidden bg-white border-t border-gray-200 safe-bottom no-print">
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
            label={
              calc.total > 0 ? `${currencySymbol}${fmt(calc.total)}` : "ใบเสนอ"
            }
            highlight={calc.total > 0}
          />
        </div>
      </nav>

      <RandomPromptModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onOpenShare={() => setShareOpen(true)}
      />
      <StressReliefModal open={reliefOpen} onClose={() => setReliefOpen(false)} />
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onOpenDonation={() => setDonationOpen(true)}
      />
      <DonationModal open={donationOpen} onClose={() => setDonationOpen(false)} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <ProfileModal
        open={profileOpen}
        profile={profile}
        onClose={() => setProfileOpen(false)}
        onSave={updateProfile}
      />

      {downloading && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin" />
            <div className="text-sm text-gray-700 font-medium">
              กำลังเตรียมเอกสาร...
            </div>
            <div className="text-xs text-gray-400">บันทึกข้อมูลและสร้าง PDF</div>
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-full text-sm transition"
    >
      {icon} <span className="hidden xl:inline">{label}</span>
    </button>
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
