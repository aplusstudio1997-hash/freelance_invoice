"use client";

import { useState } from "react";
import { useDocuments } from "@/lib/documents";
import ProfileModal from "@/components/ProfileModal";
import { Profile, getCurrencySymbol } from "@/lib/types";
import {
  UserCog,
  Pencil,
  Mail,
  Phone,
  MapPin,
  FileText,
  Globe,
  CreditCard,
  Image as ImageIcon,
  QrCode,
  Coins,
} from "lucide-react";

export default function MyDataPage() {
  const { profile, setProfile } = useDocuments();
  const [editOpen, setEditOpen] = useState(false);

  const sym = getCurrencySymbol(profile.currency);

  const save = (p: Profile) => {
    setProfile(p);
    setEditOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-brand-500 flex items-center justify-center shrink-0">
            <UserCog size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink-900">My Data</h2>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              ข้อมูลของคุณที่จะแสดงบนเอกสารต่าง ๆ — แก้ครั้งเดียวใช้ทุกใบ
            </p>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-xs font-medium transition shadow-soft"
          >
            <Pencil size={12} />
            แก้ไข
          </button>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <section className="lg:col-span-2 bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
          <h3 className="font-semibold text-ink-900 mb-4">ข้อมูลแบรนด์</h3>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
              {profile.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.logo}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={24} className="text-brand-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-ink-900 truncate">
                {profile.studioName || "ยังไม่ได้ตั้งชื่อแบรนด์"}
              </div>
              {profile.tagline && (
                <div className="text-sm text-ink-600 mt-0.5">
                  {profile.tagline}
                </div>
              )}
              {profile.ownerName && profile.ownerName !== profile.studioName && (
                <div className="text-xs text-ink-400 mt-1">
                  ผู้ดูแล: {profile.ownerName}
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            <DataRow
              icon={<Mail size={13} />}
              label="อีเมล"
              value={profile.email}
            />
            <DataRow
              icon={<Phone size={13} />}
              label="โทรศัพท์"
              value={profile.phone}
            />
            <DataRow
              icon={<MapPin size={13} />}
              label="ที่อยู่"
              value={profile.address}
              long
            />
            <DataRow
              icon={<FileText size={13} />}
              label="เลขประจำตัวผู้เสียภาษี"
              value={profile.taxId}
            />
            <DataRow
              icon={<Globe size={13} />}
              label="ลิงก์โซเชียล"
              value={profile.socialLink}
            />
            <DataRow
              icon={<Coins size={13} />}
              label="สกุลเงินตั้งต้น"
              value={`${profile.currency} (${sym})`}
            />
          </div>
        </section>

        <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
          <h3 className="font-semibold text-ink-900 mb-4">การชำระเงิน</h3>
          <div className="space-y-2.5">
            <DataRow
              icon={<CreditCard size={13} />}
              label="ธนาคาร"
              value={profile.payment.bankName}
            />
            <DataRow
              icon={<UserCog size={13} />}
              label="ชื่อบัญชี"
              value={profile.payment.accountName}
            />
            <DataRow
              icon={<FileText size={13} />}
              label="เลขที่บัญชี"
              value={profile.payment.accountNumber}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-orange-100">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-700 mb-2">
              <QrCode size={13} />
              QR PromptPay
            </div>
            {profile.payment.qrCode ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.payment.qrCode}
                alt="QR PromptPay"
                className="w-full max-w-[180px] rounded-xl border border-orange-100"
              />
            ) : (
              <div className="text-xs text-ink-400 bg-orange-50/40 border border-dashed border-orange-200 rounded-xl py-6 text-center">
                ยังไม่มี QR PromptPay
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-5 sm:p-6">
        <h3 className="font-semibold text-ink-900 mb-3">เงื่อนไขมาตรฐาน</h3>
        <div className="bg-orange-50/40 border border-orange-100 rounded-2xl px-4 py-3 text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
          {profile.terms || (
            <span className="text-ink-400">
              ยังไม่ได้ตั้งเงื่อนไขมาตรฐาน — กดปุ่ม &ldquo;แก้ไข&rdquo; เพื่อเพิ่ม
            </span>
          )}
        </div>
      </section>

      <ProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={save}
      />
    </div>
  );
}

function DataRow({
  icon,
  label,
  value,
  long,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  long?: boolean;
}) {
  const empty = !value || !value.trim();
  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-2xl bg-orange-50/40 border border-orange-100 ${
        long ? "sm:col-span-2" : ""
      }`}
    >
      <div className="w-7 h-7 rounded-lg bg-white text-brand-500 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-ink-400 uppercase tracking-wide">
          {label}
        </div>
        <div
          className={`text-sm mt-0.5 break-words ${
            empty ? "text-ink-400 italic" : "text-ink-900 font-medium"
          }`}
        >
          {empty ? "ยังไม่ได้ตั้งค่า" : value}
        </div>
      </div>
    </div>
  );
}
