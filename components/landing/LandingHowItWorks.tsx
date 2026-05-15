"use client";

import { UserPlus, Settings2, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "สมัครสมาชิก",
    desc: "ใช้อีเมลหรือ Google สมัครครั้งเดียวฟรี ไม่ต้องผูกบัตรเครดิต",
  },
  {
    icon: Settings2,
    step: "02",
    title: "ตั้งค่าโปรไฟล์",
    desc: "ใส่ชื่อแบรนด์ โลโก้ บัญชีธนาคาร และข้อมูลภาษีของคุณครั้งเดียว",
  },
  {
    icon: Rocket,
    step: "03",
    title: "เริ่มสร้างเอกสาร",
    desc: "สร้างใบเสนอราคา ออกใบแจ้งหนี้ และใบเสร็จ เริ่มเก็บประวัติได้เลย",
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-100 border border-peach-200 text-xs text-brand-700 font-medium mb-4">
            เริ่มต้นใช้งาน
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">
            เริ่มได้ใน{" "}
            <span className="text-brand-500">3 ขั้นตอน</span>
          </h2>
          <p className="mt-4 text-ink-600 text-sm sm:text-base">
            ไม่ต้องเรียนรู้นาน — สมัครเสร็จใช้งานได้ทันทีในไม่กี่นาที
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
          {STEPS.map((s, idx) => (
            <div
              key={s.step}
              className="relative bg-white/80 backdrop-blur border border-orange-100/80 rounded-2xl p-6 text-center shadow-soft"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center shadow-glow mb-4">
                <s.icon size={24} />
                <span className="absolute -top-1.5 -right-1.5 text-xs font-bold bg-ink-900 text-white px-1.5 py-0.5 rounded-full">
                  {s.step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-ink-900 mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
