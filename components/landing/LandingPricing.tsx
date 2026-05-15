"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

const PLANS = [
  {
    name: "Free",
    tagline: "เริ่มต้นใช้งานฟรี",
    price: "฿0",
    period: "ตลอดช่วง Beta",
    features: [
      "ใบเสนอราคา / ใบแจ้งหนี้ / ใบเสร็จ ไม่จำกัด",
      "Clients CRM พื้นฐาน",
      "บันทึกรายได้-รายจ่าย",
      "Subscription Tracker",
      "PDF คุณภาพมืออาชีพ",
      "พื้นที่จัดเก็บ 100 MB",
    ],
    cta: "เริ่มใช้ฟรี",
    available: true,
    highlight: false,
  },
  {
    name: "Pro",
    tagline: "สำหรับฟรีแลนซ์มืออาชีพ",
    price: "฿199",
    period: "/ เดือน",
    features: [
      "ทุกอย่างใน Free",
      "AI Quick Price Check ไม่จำกัด",
      "Suppliers Hub พร้อมไฟล์ตัวอย่าง",
      "ส่งออกข้อมูลภาษีรายปี (PND)",
      "Logo บนเอกสารแบบ custom",
      "พื้นที่จัดเก็บ 5 GB",
      "Priority support",
    ],
    cta: "เร็ว ๆ นี้",
    available: false,
    highlight: true,
  },
  {
    name: "Business",
    tagline: "สำหรับสตูดิโอและทีม",
    price: "฿499",
    period: "/ เดือน",
    features: [
      "ทุกอย่างใน Pro",
      "ผู้ใช้หลายคนในแบรนด์เดียวกัน",
      "เทมเพลตเอกสารแบบ custom",
      "API สำหรับเชื่อมระบบอื่น",
      "Audit log + role permissions",
      "พื้นที่จัดเก็บ 50 GB",
      "Dedicated support",
    ],
    cta: "เร็ว ๆ นี้",
    available: false,
    highlight: false,
  },
];

export default function LandingPricing() {
  const { user, loading } = useAuth();
  const ctaHref = user ? "/app" : "/auth";

  return (
    <section id="pricing" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs text-brand-700 font-medium mb-4">
            ราคา
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">
            แพลนที่เหมาะกับคุณ
          </h2>
          <p className="mt-4 text-ink-600 text-sm sm:text-base">
            ใช้งานฟรีตลอดช่วง Beta — แพลน Pro และ Business จะเปิดให้ใช้เร็ว ๆ นี้
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-6 sm:p-8 transition-all ${
                p.highlight
                  ? "bg-ink-900 text-white shadow-soft-lg lg:scale-[1.02]"
                  : "bg-white/80 backdrop-blur border border-orange-100/80 shadow-soft"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-semibold">
                  <Sparkles size={11} />
                  แนะนำ
                </div>
              )}

              <div className="flex items-baseline gap-2 mb-1">
                <h3
                  className={`text-xl font-bold ${
                    p.highlight ? "text-white" : "text-ink-900"
                  }`}
                >
                  {p.name}
                </h3>
                {!p.available && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      p.highlight
                        ? "bg-white/15 text-white/80"
                        : "bg-orange-50 text-brand-700 border border-brand-100"
                    }`}
                  >
                    เร็ว ๆ นี้
                  </span>
                )}
              </div>
              <p
                className={`text-xs mb-5 ${
                  p.highlight ? "text-white/70" : "text-ink-400"
                }`}
              >
                {p.tagline}
              </p>

              <div className="mb-6">
                <span
                  className={`text-3xl font-bold ${
                    p.highlight ? "text-white" : "text-ink-900"
                  }`}
                >
                  {p.price}
                </span>
                <span
                  className={`text-sm ml-1 ${
                    p.highlight ? "text-white/60" : "text-ink-400"
                  }`}
                >
                  {p.period}
                </span>
              </div>

              <ul className="space-y-2.5 mb-8">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      p.highlight ? "text-white/80" : "text-ink-600"
                    }`}
                  >
                    <Check
                      size={15}
                      className={`mt-0.5 shrink-0 ${
                        p.highlight ? "text-brand-400" : "text-brand-500"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {p.available && !loading ? (
                <Link
                  href={ctaHref}
                  className={`block w-full text-center px-5 py-3 rounded-full text-sm font-medium transition ${
                    p.highlight
                      ? "bg-brand-500 hover:bg-brand-400 text-white"
                      : "bg-ink-900 hover:bg-ink-800 text-white"
                  }`}
                >
                  {p.cta}
                </Link>
              ) : (
                <button
                  disabled
                  className={`w-full px-5 py-3 rounded-full text-sm font-medium cursor-not-allowed ${
                    p.highlight
                      ? "bg-white/10 text-white/50"
                      : "bg-orange-50 text-brand-400"
                  }`}
                >
                  {p.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
