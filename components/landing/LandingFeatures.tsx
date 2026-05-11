"use client";

import {
  FileText,
  Users,
  Wallet,
  Repeat,
  Sparkles,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "เอกสารครบจบในที่เดียว",
    desc: "ใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ — สร้าง PDF คมชัดภาษาไทย ผูกเอกสารถึงกันอัตโนมัติ",
    tone: "orange",
  },
  {
    icon: Wallet,
    title: "Finance & Tax",
    desc: "บันทึกรายได้-รายจ่าย คำนวณ VAT 7% / WHT 3% สรุปยอดรายเดือนเพื่อยื่นภาษี",
    tone: "peach",
  },
  {
    icon: Users,
    title: "Clients CRM",
    desc: "เก็บข้อมูลลูกค้าเป็นรายชื่อ เลือกใช้ในเอกสารใหม่ได้ทันที — ดูประวัติงานต่อราย",
    tone: "orange",
  },
  {
    icon: Repeat,
    title: "Subscription Tracker",
    desc: "ติดตาม subscription รายเดือน-รายปี เตือนก่อนต่ออายุ สรุปค่าใช้จ่ายต่อเดือน",
    tone: "peach",
  },
  {
    icon: Briefcase,
    title: "Suppliers Hub",
    desc: "จดบันทึก supplier และไฟล์ตัวอย่างงาน เก็บเป็นคลังอ้างอิงสำหรับเสนองาน",
    tone: "orange",
  },
  {
    icon: Sparkles,
    title: "AI Quick Price Check",
    desc: "ลังเลเรื่องราคา? ให้ AI ช่วยประเมินเรทตามตลาดและคิด WHT 3% ให้อัตโนมัติ",
    tone: "peach",
    badge: "เร็ว ๆ นี้",
  },
] as const;

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs text-brand-700 font-medium mb-4">
            ฟีเจอร์ทั้งหมด
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">
            ทุกอย่างที่ฟรีแลนซ์ต้องใช้
            <br />
            <span className="text-brand-500">ในที่เดียว</span>
          </h2>
          <p className="mt-4 text-ink-600 text-sm sm:text-base">
            เลิกกระจายข้อมูลในไฟล์ Excel หลายตาราง — รวมไว้ที่เดียว ใช้ฟรี
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  tone,
  badge,
}: {
  icon: typeof FileText;
  title: string;
  desc: string;
  tone: "orange" | "peach";
  badge?: string;
}) {
  const iconBg =
    tone === "orange"
      ? "bg-brand-500 text-white"
      : "bg-peach-200 text-brand-700";
  return (
    <div className="group relative bg-white/70 backdrop-blur border border-orange-100/80 rounded-2xl p-6 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-soft`}
        >
          <Icon size={20} />
        </div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-100">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-ink-900 mb-2">{title}</h3>
      <p className="text-sm text-ink-600 leading-relaxed">{desc}</p>
      <ArrowRight
        size={16}
        className="absolute bottom-5 right-5 text-ink-200 group-hover:text-brand-500 group-hover:translate-x-0.5 transition"
      />
    </div>
  );
}
