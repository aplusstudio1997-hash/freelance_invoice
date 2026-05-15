"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useDocuments } from "@/lib/documents";
import UserMenu from "@/components/UserMenu";
import FeedbackModal from "@/components/FeedbackModal";
import DonationModal from "@/components/DonationModal";
import ShareModal from "@/components/ShareModal";
import AiPriceCheckModal from "@/components/dashboard/AiPriceCheckModal";
import {
  Bell,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Heart,
  Share2,
} from "lucide-react";

const LINE_OA_URL = "https://lin.ee/";

export default function AppHeader() {
  const { user } = useAuth();
  const { role } = useDocuments();
  const studioName =
    (user?.user_metadata?.studio_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "freelancer";

  const isAdmin = role === "admin";

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="px-3 sm:px-6 pt-3 sm:pt-4 relative z-30">
        <div className="bg-white/85 backdrop-blur border border-orange-100 rounded-3xl shadow-soft px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="p-2 rounded-full text-ink-400 hover:text-ink-800 hover:bg-orange-50 transition shrink-0"
              aria-label="กลับหน้าหลัก"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-ink-900 text-white flex items-center justify-center font-bold text-xs leading-none shrink-0">
              <span>
                So<span className="text-brand-400">1</span>
                <br />o
              </span>
            </div>
            <div className="min-w-0 leading-tight hidden sm:block">
              <div className="font-bold text-ink-900 text-sm truncate">
                So1o Freelancer
              </div>
              <div className="text-xs text-ink-400 truncate">
                หลังบ้านฟรีแลนซ์ของคุณ
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LINE OA"
              title="ติดต่อทาง LINE OA"
              className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition shadow-soft"
            >
              <MessageCircle size={16} />
            </a>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="แจ้งเตือน"
                title="แจ้งเตือน"
                className="w-9 h-9 rounded-full bg-white text-ink-600 hover:bg-orange-50 border border-orange-100 flex items-center justify-center transition shadow-soft"
              >
                <Bell size={16} />
              </button>
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-orange-100 rounded-2xl shadow-soft-lg z-[70] overflow-hidden">
                    <div className="px-4 py-3 border-b border-orange-100">
                      <div className="font-semibold text-ink-900 text-sm">
                        การแจ้งเตือน
                      </div>
                      <div className="text-xs text-ink-400 mt-0.5">
                        ยังไม่มีรายการใหม่
                      </div>
                    </div>
                    <div className="p-4 text-xs text-ink-500 text-center">
                      ระบบแจ้งเตือนเต็มรูปแบบ
                      <br />
                      จะเปิดให้ใช้เร็ว ๆ นี้
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setAiOpen(true)}
              aria-label="AI Price Check"
              title="AI Quick Price Check"
              className="w-9 h-9 rounded-full bg-white text-brand-500 hover:bg-orange-50 border border-orange-100 flex items-center justify-center transition shadow-soft"
            >
              <Sparkles size={16} />
            </button>

            <div className="w-px h-5 bg-orange-100 mx-0.5 hidden sm:block" />

            <button
              onClick={() => setFeedbackOpen(true)}
              aria-label="ส่งข้อเสนอแนะ"
              title="ส่งข้อเสนอแนะ"
              className="hidden sm:flex w-9 h-9 rounded-full bg-white text-ink-600 hover:bg-orange-50 border border-orange-100 items-center justify-center transition shadow-soft"
            >
              <MessageSquare size={15} />
            </button>

            <button
              onClick={() => setDonationOpen(true)}
              aria-label="สนับสนุน"
              title="สนับสนุนเรา"
              className="hidden sm:flex w-9 h-9 rounded-full bg-white text-rose-500 hover:bg-rose-50 border border-orange-100 items-center justify-center transition shadow-soft"
            >
              <Heart size={15} />
            </button>

            <button
              onClick={() => setShareOpen(true)}
              aria-label="แชร์"
              title="แชร์ให้เพื่อน"
              className="hidden sm:flex w-9 h-9 rounded-full bg-white text-ink-600 hover:bg-orange-50 border border-orange-100 items-center justify-center transition shadow-soft"
            >
              <Share2 size={15} />
            </button>

            {isAdmin && (
              <Link
                href="/app/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-900 text-white text-xs font-medium hover:bg-ink-800 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Admin
              </Link>
            )}

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-brand-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="max-w-[140px] truncate">{studioName}</span>
            </div>

            <UserMenu />
          </div>
        </div>
      </header>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onOpenDonation={() => {
          setFeedbackOpen(false);
          setDonationOpen(true);
        }}
      />
      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
      />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <AiPriceCheckModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
