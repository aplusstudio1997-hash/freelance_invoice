"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ArrowRight } from "lucide-react";

export default function LandingCTA() {
  const { user, loading } = useAuth();
  const ctaHref = user ? "/app" : "/auth";
  const ctaLabel = user ? "เข้าใช้งาน" : "เริ่มใช้ฟรีเลย";

  return (
    <section className="py-20 sm:py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative bg-ink-900 rounded-3xl px-6 sm:px-12 py-12 sm:py-16 overflow-hidden text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-peach-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              พร้อมจัดระเบียบหลังบ้านของคุณแล้วหรือยัง?
            </h2>
            <p className="mt-4 text-white/70 text-sm sm:text-base max-w-xl mx-auto">
              เริ่มสร้างเอกสารเเรกของคุณภายใน 2 นาที — ฟรีตลอดช่วง Beta
            </p>

            {!loading && (
              <Link
                href={ctaHref}
                className="group inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full bg-brand-500 hover:bg-brand-400 text-white font-medium text-sm transition shadow-glow"
              >
                {ctaLabel}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
