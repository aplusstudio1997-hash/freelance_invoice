"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useDocuments } from "@/lib/documents";
import UserMenu from "@/components/UserMenu";
import { Bell, MessageCircle, Sparkles, ArrowLeft } from "lucide-react";

export default function AppHeader() {
  const { user } = useAuth();
  const { role } = useDocuments();
  const studioName =
    (user?.user_metadata?.studio_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "freelancer";

  const isAdmin = role === "admin";

  return (
    <header className="px-3 sm:px-6 pt-3 sm:pt-4">
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
            <div className="text-[11px] text-ink-400 truncate">
              หลังบ้านฟรีแลนซ์ของคุณ
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <IconBtn
            label="LINE OA"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <MessageCircle size={16} />
          </IconBtn>
          <IconBtn
            label="แจ้งเตือน"
            className="bg-white text-ink-600 hover:bg-orange-50 border border-orange-100"
          >
            <Bell size={16} />
          </IconBtn>
          <IconBtn
            label="AI Mentor"
            className="bg-white text-brand-500 hover:bg-orange-50 border border-orange-100"
          >
            <Sparkles size={16} />
          </IconBtn>

          {isAdmin && (
            <Link
              href="/app/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-900 text-white text-xs font-medium hover:bg-ink-800 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Admin
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-brand-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="max-w-[140px] truncate">{studioName}</span>
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-soft ${className}`}
    >
      {children}
    </button>
  );
}
