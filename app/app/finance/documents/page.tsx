"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  QuoteSettings,
  Profile,
  DEFAULT_QUOTE,
  getCurrencySymbol,
} from "@/lib/types";
import { clearDraft } from "@/lib/storage";
import { calculate, fmt } from "@/lib/calc";
import { sendQuote, fetchStats, pingActive } from "@/lib/api";
import { useDocuments } from "@/lib/documents";
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
import SuccessModal from "@/components/SuccessModal";
import DocumentTabs from "@/components/DocumentTabs";
import InvoiceReceiptFields from "@/components/InvoiceReceiptFields";
import MigrationModal from "@/components/MigrationModal";
import {
  Dice5,
  Smile,
  RotateCcw,
  Save,
  Settings,
  ListPlus,
  Calendar,
  FileText,
  MessageSquare,
  Heart,
  Share2,
  UserCog,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type Tab = "settings" | "services" | "timeline" | "preview";

export default function FinancePage() {
  const {
    activeType,
    data,
    profile,
    shouldShowMigration,
    dismissMigration,
    completeMigration,
    setData: ctxSetData,
    setProfile: ctxSetProfile,
  } = useDocuments();

  const [promptOpen, setPromptOpen] = useState(false);
  const [reliefOpen, setReliefOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [, setStats] = useState<{
    totalQuotes: number | null;
    activeUsers: number | null;
  }>({ totalQuotes: null, activeUsers: null });

  const [downloading, setDownloading] = useState(false);
  const [mobileTab, setMobileTab] = useState<Tab>("settings");

  const setData = ctxSetData;
  const setProfile = ctxSetProfile;

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      const s = await fetchStats();
      if (cancelled || !s) return;
      setStats({ totalQuotes: s.totalQuotes, activeUsers: s.activeUsers });
    };
    pingActive().catch(() => {});
    loadStats();
    const pingInterval = setInterval(() => {
      pingActive().catch(() => {});
    }, 60 * 1000);
    const statsInterval = setInterval(loadStats, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(pingInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const update = useCallback(
    (patch: Partial<QuoteSettings>) => {
      setData({ ...data, ...patch });
    },
    [data, setData]
  );

  const updateProfile = (p: Profile) => {
    setProfile(p);
  };

  const calc = useMemo(() => calculate(data), [data]);
  const currencySymbol = getCurrencySymbol(profile.currency);

  const resetAll = () => {
    if (confirm("ล้างข้อมูลในเอกสารปัจจุบัน?")) {
      clearDraft();
      setData(DEFAULT_QUOTE);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      await sendQuote(data, calc, profile);
    } catch (e) {
      console.error("sendQuote failed", e);
    }
    setTimeout(() => {
      setDownloading(false);
      setSuccessOpen(true);
      fetchStats().then((s) => {
        if (s)
          setStats({ totalQuotes: s.totalQuotes, activeUsers: s.activeUsers });
      });
    }, 250);
  };

  const openPDF = () => {
    setSuccessOpen(false);
    window.open("/print", "_blank");
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="hidden lg:flex flex-wrap items-center gap-1.5 bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-3 px-4">
        <span className="text-xs text-ink-400 mr-2">เครื่องมือ</span>
        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-600 hover:text-red-500 hover:bg-red-50 rounded-full transition"
        >
          <RotateCcw size={12} />
          Reset เอกสาร
        </button>
        <FinHeaderBtn
          icon={<Dice5 size={12} />}
          label="สุ่มโจทย์"
          onClick={() => setPromptOpen(true)}
        />
        <FinHeaderBtn
          icon={<Smile size={12} />}
          label="คลายเครียด"
          onClick={() => setReliefOpen(true)}
        />
        <div className="w-px h-4 bg-orange-100 mx-1" />
        <FinHeaderBtn
          icon={<MessageSquare size={12} />}
          label="Feedback"
          onClick={() => setFeedbackOpen(true)}
          ghost
        />
        <FinHeaderBtn
          icon={<Heart size={12} />}
          label="Donation"
          onClick={() => setDonationOpen(true)}
          ghost
        />
        <FinHeaderBtn
          icon={<Share2 size={12} />}
          label="Share"
          onClick={() => setShareOpen(true)}
          ghost
        />
        <FinHeaderBtn
          icon={<UserCog size={12} />}
          label="ตั้งค่าส่วนตัว"
          onClick={() => setProfileOpen(true)}
          ghost
        />
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        <DocumentTabs />

        <div className="flex flex-col lg:flex-row min-h-[60vh]">
          <div
            className={`${
              mobileTab === "settings" ? "flex" : "hidden"
            } lg:flex flex-1 lg:flex-none min-h-0 flex-col`}
          >
            {activeType !== "quote" && (
              <div className="px-3 sm:px-4 pt-3">
                <InvoiceReceiptFields
                  type={activeType}
                  data={data}
                  update={update}
                  currency={profile.currency}
                />
              </div>
            )}
            <SettingsPanel
              data={data}
              update={update}
              currencySymbol={currencySymbol}
            />
          </div>
          <div
            className={`${
              mobileTab === "services" ? "flex" : "hidden"
            } lg:flex flex-1 lg:flex-none min-h-0`}
          >
            <ServicesPanel
              data={data}
              update={update}
              currencySymbol={currencySymbol}
              calc={calc}
            />
          </div>
          <div
            className={`${
              mobileTab === "timeline" ? "flex" : "hidden"
            } lg:flex flex-1 lg:flex-1 min-h-0`}
          >
            <TimelinePanel
              data={data}
              update={update}
              calc={calc}
              currencySymbol={currencySymbol}
            />
          </div>
          <div
            className={`${
              mobileTab === "preview" ? "flex" : "hidden"
            } lg:flex flex-1 lg:flex-none min-h-0`}
          >
            <QuotePreview
              data={data}
              calc={calc}
              profile={profile}
              currencySymbol={currencySymbol}
              onDownload={downloadPDF}
              downloading={downloading}
              type={activeType}
            />
          </div>
        </div>

        <nav className="lg:hidden bg-white border-t border-orange-100 safe-bottom no-print">
          <div className="px-1.5 py-1 grid grid-cols-4 gap-0.5">
            <FinTabBtn
              active={mobileTab === "settings"}
              onClick={() => setMobileTab("settings")}
              icon={<Settings size={18} />}
              label="ตั้งค่า"
            />
            <FinTabBtn
              active={mobileTab === "services"}
              onClick={() => setMobileTab("services")}
              icon={<ListPlus size={18} />}
              label="บริการ"
              badge={data.services.length > 0 ? data.services.length : undefined}
            />
            <FinTabBtn
              active={mobileTab === "timeline"}
              onClick={() => setMobileTab("timeline")}
              icon={<Calendar size={18} />}
              label="ไทม์ไลน์"
            />
            <FinTabBtn
              active={mobileTab === "preview"}
              onClick={() => setMobileTab("preview")}
              icon={<FileText size={18} />}
              label={
                calc.total > 0 ? `${currencySymbol}${fmt(calc.total)}` : "PDF"
              }
              highlight={calc.total > 0}
            />
          </div>
        </nav>
      </section>

      <RandomPromptModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onOpenShare={() => setShareOpen(true)}
      />
      <StressReliefModal
        open={reliefOpen}
        onClose={() => setReliefOpen(false)}
      />
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onOpenDonation={() => setDonationOpen(true)}
      />
      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
      />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <ProfileModal
        open={profileOpen}
        profile={profile}
        onClose={() => setProfileOpen(false)}
        onSave={updateProfile}
      />
      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        onFeedback={() => {
          setSuccessOpen(false);
          setFeedbackOpen(true);
        }}
        onDonate={() => {
          setSuccessOpen(false);
          setDonationOpen(true);
        }}
        onViewPDF={openPDF}
      />

      {shouldShowMigration && (
        <MigrationModal
          onClose={dismissMigration}
          onDone={completeMigration}
        />
      )}

      {downloading && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl px-8 py-6 shadow-soft-lg flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin" />
            <div className="text-sm text-ink-800 font-medium">
              กำลังเตรียมเอกสาร...
            </div>
            <div className="text-xs text-ink-400">บันทึกข้อมูลและสร้าง PDF</div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinHeaderBtn({
  icon,
  label,
  onClick,
  ghost,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  ghost?: boolean;
}) {
  const cls = ghost
    ? "flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-ink-600 hover:text-brand-600 hover:bg-orange-50 rounded-full transition"
    : "flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-brand-600 border border-orange-200 hover:border-brand-300 hover:bg-orange-50 rounded-full transition";
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function FinTabBtn({
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
          ? "text-brand-600 bg-orange-50"
          : "text-ink-400 active:bg-orange-50/50"
      }`}
    >
      {icon}
      <span
        className={`text-[10px] mt-0.5 ${
          highlight && !active ? "text-brand-600 font-semibold" : ""
        }`}
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
