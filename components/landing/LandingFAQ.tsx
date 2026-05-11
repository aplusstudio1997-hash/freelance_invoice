"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "ใช้งานฟรีจริงเหรอ?",
    a: "ใช่ครับ ในช่วง Beta นี้ทุกฟีเจอร์ใช้ได้ฟรีไม่จำกัด ไม่ต้องผูกบัตรเครดิต ในอนาคตจะเปิดแพลน Pro และ Business เพิ่มแต่แพลน Free จะยังคงอยู่",
  },
  {
    q: "ข้อมูลของผมปลอดภัยไหม?",
    a: "ข้อมูลทั้งหมดเก็บใน Supabase ซึ่งใช้ PostgreSQL พร้อมระบบความปลอดภัยมาตรฐาน — ผู้ใช้รายอื่นเข้าถึงข้อมูลของคุณไม่ได้ และคุณดาวน์โหลด/ลบข้อมูลของตัวเองได้ตลอดเวลา",
  },
  {
    q: "ใช้ออกใบกำกับภาษีได้ไหม?",
    a: "ระบบสร้างใบเสนอราคา ใบแจ้งหนี้ และใบเสร็จรับเงินที่มีรายละเอียดครบถ้วน — สามารถเปิด VAT 7% และคำนวณ WHT 3% ได้ ส่วนการขึ้นทะเบียนภาษีมูลค่าเพิ่มต้องดำเนินการกับกรมสรรพากรเอง",
  },
  {
    q: "PDF ที่สร้างเป็นภาษาไทยคมชัดไหม?",
    a: "คมชัดครับ ระบบใช้ font Sarabun และสร้าง PDF แบบ vector ที่คัดลอกข้อความได้ ไฟล์ขนาดเล็ก พิมพ์ออกมาคมทุก resolution",
  },
  {
    q: "มีแอปบนมือถือไหม?",
    a: "ตอนนี้ยังเป็น web app ที่ใช้ได้ทุกเบราว์เซอร์ — รองรับมือถือเต็มรูปแบบ บันทึกหน้าจอเป็น PWA ได้ ในอนาคตจะมีแอป iOS / Android",
  },
  {
    q: "ยกเลิกได้ตลอดไหม?",
    a: "ตอนนี้ใช้ฟรีจึงไม่มีการยกเลิก — ในอนาคตเมื่อสมัคร Pro หรือ Business สามารถยกเลิกได้ทันที ไม่ผูกมัดสัญญา",
  },
];

export default function LandingFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-100 border border-peach-200 text-xs text-brand-700 font-medium mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">
            คำถามที่พบบ่อย
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className={`bg-white/80 backdrop-blur border rounded-2xl overflow-hidden transition ${
                openIdx === i
                  ? "border-brand-200 shadow-soft"
                  : "border-orange-100/80"
              }`}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-ink-900 text-sm sm:text-base pr-4">
                  {f.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-ink-400 transition ${
                    openIdx === i ? "rotate-180 text-brand-500" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all ${
                  openIdx === i ? "max-h-60" : "max-h-0"
                }`}
              >
                <div className="px-5 pb-4 text-sm text-ink-600 leading-relaxed">
                  {f.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
