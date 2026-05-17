"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useDocuments } from "@/lib/documents";
import {
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Lock,
  HelpCircle,
  MessageSquare,
  Heart,
  Share2,
  ExternalLink,
  Trash2,
  ChevronRight,
} from "lucide-react";
import FeedbackModal from "@/components/FeedbackModal";
import DonationModal from "@/components/DonationModal";
import ShareModal from "@/components/ShareModal";
import { version as APP_VERSION } from "@/package.json";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { documents } = useDocuments();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    if (!confirm("ออกจากระบบใช่ไหม?")) return;
    setSigningOut(true);
    try {
      await signOut();
      // use replace so the back button doesn't return to the protected page,
      // and rely on AppLayout's redirect to /auth instead of racing it with
      // a push to "/"
      router.replace("/auth");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
            <SettingsIcon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink-900">ตั้งค่า</h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              จัดการบัญชี การแจ้งเตือน และสนับสนุนเรา
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <h3 className="font-semibold text-ink-900 mb-4">บัญชี</h3>
        <div className="space-y-3">
          <InfoRow label="อีเมล" value={user?.email || "—"} />
          <InfoRow label="เอกสารทั้งหมด" value={`${documents.length} ฉบับ`} />
          <InfoRow
            label="สมัครเมื่อ"
            value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </div>
        <div className="mt-4 pt-4 border-t border-orange-100 grid sm:grid-cols-2 gap-2">
          <ActionRow
            icon={<Lock size={14} />}
            label="เปลี่ยนรหัสผ่าน"
            description="เร็ว ๆ นี้"
            disabled
          />
          <ActionRow
            icon={<Bell size={14} />}
            label="การแจ้งเตือน"
            description="เร็ว ๆ นี้"
            disabled
          />
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <h3 className="font-semibold text-ink-900 mb-4">สนับสนุนและช่วยเหลือ</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <ActionRow
            icon={<MessageSquare size={14} />}
            label="ส่งข้อเสนอแนะ"
            description="บอกเราว่าอะไรน่าจะปรับปรุง"
            onClick={() => setFeedbackOpen(true)}
          />
          <ActionRow
            icon={<Heart size={14} />}
            label="สนับสนุน (Donation)"
            description="ช่วยให้ระบบขับเคลื่อนต่อไป"
            onClick={() => setDonationOpen(true)}
          />
          <ActionRow
            icon={<Share2 size={14} />}
            label="แชร์ให้เพื่อนฟรีแลนซ์"
            description="ส่งต่อเครื่องมือดี ๆ"
            onClick={() => setShareOpen(true)}
          />
          <ActionRow
            icon={<HelpCircle size={14} />}
            label="คู่มือการใช้งาน"
            description="เร็ว ๆ นี้"
            disabled
          />
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <h3 className="font-semibold text-ink-900 mb-3">เกี่ยวกับ</h3>
        <div className="text-xs text-ink-400 space-y-1">
          <div>So1o Freelancer v{APP_VERSION} — Beta</div>
          <div>หลังบ้านฟรีแลนซ์ของคุณ</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <a
            href="#"
            className="inline-flex items-center gap-1 text-ink-600 hover:text-brand-600 transition"
          >
            ข้อกำหนดการใช้งาน
            <ExternalLink size={11} />
          </a>
          <span className="text-ink-300">·</span>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-ink-600 hover:text-brand-600 transition"
          >
            ความเป็นส่วนตัว
            <ExternalLink size={11} />
          </a>
          <span className="text-ink-300">·</span>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-ink-600 hover:text-brand-600 transition"
          >
            นโยบาย Beta
            <ExternalLink size={11} />
          </a>
        </div>
      </section>

      <section className="bg-red-50/50 border border-red-100 rounded-3xl shadow-soft p-5 sm:p-6">
        <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
          <Trash2 size={15} />
          พื้นที่อันตราย
        </h3>
        <div className="space-y-2">
          <button
            onClick={onSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-sm text-red-700 transition disabled:opacity-60"
          >
            <LogOut size={14} />
            <span className="flex-1 text-left font-medium">
              {signingOut ? "กำลังออก..." : "ออกจากระบบ"}
            </span>
            <ChevronRight size={14} />
          </button>
          <div className="text-xs text-ink-400">
            ลบบัญชีถาวร — ติดต่อทีมงานผ่านปุ่ม &ldquo;ส่งข้อเสนอแนะ&rdquo; ด้านบน
          </div>
        </div>
      </section>

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
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/40 border border-orange-100">
      <span className="text-xs text-ink-400">{label}</span>
      <span className="text-sm text-ink-900 font-medium truncate ml-3">
        {value}
      </span>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 p-3 rounded-2xl border border-orange-100 text-left transition ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-brand-200 hover:bg-orange-50/50"
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900 truncate">
          {label}
        </div>
        {description && (
          <div className="text-xs text-ink-400 truncate">{description}</div>
        )}
      </div>
      <ChevronRight size={14} className="text-ink-300 shrink-0" />
    </button>
  );
}
