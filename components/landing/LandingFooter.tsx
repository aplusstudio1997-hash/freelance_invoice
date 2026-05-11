"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "ผลิตภัณฑ์",
    links: [
      { href: "#features", label: "ฟีเจอร์" },
      { href: "#pricing", label: "ราคา" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "บริษัท",
    links: [
      { href: "#", label: "เกี่ยวกับเรา" },
      { href: "#", label: "บล็อก" },
      { href: "#", label: "ติดต่อ" },
    ],
  },
  {
    title: "ข้อกำหนด",
    links: [
      { href: "#", label: "ข้อกำหนดการใช้งาน" },
      { href: "#", label: "ความเป็นส่วนตัว" },
      { href: "#", label: "นโยบาย Beta" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-orange-100 bg-white/40 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-ink-900 text-white flex items-center justify-center font-bold text-sm leading-none">
                <span>
                  So<span className="text-brand-400">1</span>
                  <br />o
                </span>
              </div>
              <div className="leading-tight">
                <div className="font-bold text-ink-900 text-sm">
                  So1o Freelancer
                </div>
                <div className="text-[10px] text-ink-400">
                  หลังบ้านฟรีแลนซ์ของคุณ
                </div>
              </div>
            </Link>
            <p className="mt-4 text-sm text-ink-600 leading-relaxed max-w-sm">
              ระบบจัดการเอกสาร รายได้ ภาษี และลูกค้าสำหรับฟรีแลนซ์ในประเทศไทย —
              ออกแบบโดยฟรีแลนซ์เพื่อฟรีแลนซ์
            </p>
          </div>
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <div className="font-semibold text-ink-900 text-sm mb-3">
                {col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-ink-600 hover:text-brand-600 transition"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-ink-400">
            © {new Date().getFullYear()} So1o Freelancer — ใช้ฟรีตลอดช่วง Beta
          </div>
          <div className="text-xs text-ink-400">Made in Thailand 🇹🇭</div>
        </div>
      </div>
    </footer>
  );
}
