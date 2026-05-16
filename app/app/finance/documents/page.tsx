"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  QuoteSettings,
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
import SuccessModal from "@/components/SuccessModal";
import DocumentTabs from "@/components/DocumentTabs";
import InvoiceReceiptFields from "@/components/InvoiceReceiptFields";
import MigrationModal from "@/components/MigrationModal";
import {
  Dice5,
  Smile,
  RotateCcw,
  FileText,
  Loader2,
  Settings2,
  ListPlus,
  Calendar,
} from "lucide-react";

export default function FinancePage() {
  const {
    activeType,
    data,
    profile,
    shouldShowMigration,
    dismissMigration,
    completeMigration,
    setData,
    flushSave,
  } = useDocuments();

  const [promptOpen, setPromptOpen] = useState(false);
  const [reliefOpen, setReliefOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [, setStats] = useState<{
    totalQuotes: number | null;
    activeUsers: number | null;
  }>({ totalQuotes: null, activeUsers: null });

  const [downloading, setDownloading] = useState(false);
  const [panelTab, setPanelTab] = useState<"settings" | "services" | "timeline">(
    "settings"
  );

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
      await flushSave();
    } catch (e) {
      console.error("flushSave failed", e);
    }
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

  const openPDF = async () => {
    setSuccessOpen(false);
    try {
      await flushSave();
    } catch {}
    window.open("/print", "_blank");
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="hidden lg:flex flex-wrap items-center gap-1.5 bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-3 px-4">
        <span className="text-xs text-ink-400 mr-2">เครื่องมือเอกสาร</span>
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
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        <DocumentTabs />
      </section>

      <div className="space-y-4 sm:space-y-5">
        {activeType !== "quote" && (
          <div className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
            <InvoiceReceiptFields
              type={activeType}
              data={data}
              update={update}
              currency={profile.currency}
            />
          </div>
        )}

        <div className="bg-white/85 backdrop-blur border border-orange-100 rounded-full shadow-soft p-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {(
            [
              { id: "settings", label: "ตั้งค่าใบเสนอราคา", icon: Settings2 },
              { id: "services", label: "จัดการบริการ", icon: ListPlus },
              { id: "timeline", label: "ไทม์ไลน์", icon: Calendar },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = panelTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPanelTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                  active
                    ? "bg-brand-500 text-white shadow-soft"
                    : "text-ink-600 hover:text-ink-900 hover:bg-orange-50"
                }`}
              >
                <Icon size={14} />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
          {panelTab === "settings" && (
            <SettingsPanel
              data={data}
              update={update}
              currencySymbol={currencySymbol}
            />
          )}
          {panelTab === "services" && (
            <ServicesPanel
              data={data}
              update={update}
              currencySymbol={currencySymbol}
              calc={calc}
            />
          )}
          {panelTab === "timeline" && (
            <TimelinePanel
              data={data}
              update={update}
              calc={calc}
              currencySymbol={currencySymbol}
            />
          )}
        </div>

        <QuotePreview
          data={data}
          calc={calc}
          profile={profile}
          currencySymbol={currencySymbol}
          onDownload={downloadPDF}
          downloading={downloading}
          type={activeType}
        />

        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500 text-white font-semibold text-base transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                กำลังสร้าง PDF...
              </>
            ) : (
              <>
                <FileText size={18} />
                ดาวน์โหลด PDF {calc.total > 0 && `(${currencySymbol}${fmt(calc.total)})`}
              </>
            )}
          </button>
        </div>
      </div>

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
