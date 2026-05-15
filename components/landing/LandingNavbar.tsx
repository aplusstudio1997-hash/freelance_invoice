"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "ฟีเจอร์" },
  { href: "#how-it-works", label: "วิธีใช้" },
  { href: "#pricing", label: "ราคา" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNavbar() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ctaHref = user ? "/app" : "/auth";
  const ctaLabel = user ? "เข้าใช้งาน" : "เข้าสู่ระบบ";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all ${
        scrolled
          ? "bg-white/80 backdrop-blur border-b border-orange-100/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-ink-900 text-white flex items-center justify-center font-bold text-sm leading-none">
            <span>
              So<span className="text-brand-400">1</span>
              <br />o
            </span>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-ink-900 text-sm">So1o Freelancer</div>
            <div className="text-xs text-ink-400">หลังบ้านฟรีแลนซ์ของคุณ</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-ink-600 hover:text-ink-900 transition rounded-md"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {!loading && (
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-medium transition shadow-soft"
            >
              {ctaLabel}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition"
              />
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-ink-800"
          aria-label="เปิดเมนู"
        >
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 right-0 bottom-0 w-72 bg-white shadow-2xl p-5 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="font-bold text-ink-900">เมนู</div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-ink-400"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 mb-6">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-ink-700 hover:bg-peach-50 rounded-md"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            {!loading && (
              <Link
                href={ctaHref}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-ink-900 text-white text-sm font-medium"
              >
                {ctaLabel}
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
