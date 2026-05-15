"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDocuments } from "@/lib/documents";
import { Shield, LayoutGrid, Users, MessageSquare, Loader2 } from "lucide-react";

const ADMIN_TABS = [
  { href: "/app/admin", label: "ภาพรวม", icon: LayoutGrid },
  { href: "/app/admin/users", label: "Users", icon: Users },
  { href: "/app/admin/feedback", label: "Feedback", icon: MessageSquare },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useDocuments();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (role !== "admin") {
      router.replace("/app/dashboard");
    } else {
      setReady(true);
    }
  }, [loading, role, router]);

  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center py-20 text-ink-400 text-sm">
        <Loader2 size={14} className="animate-spin mr-2" />
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-ink-900 text-white rounded-3xl shadow-soft-lg p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-peach-300/10 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-glow">
            <Shield size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                Admin Access
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              ดูข้อมูลผู้ใช้ ความคิดเห็น และสถิติการใช้งานระบบ
            </p>
          </div>
        </div>
      </section>

      <div className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-full shadow-soft p-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {ADMIN_TABS.map((t) => {
          const Icon = t.icon;
          const active =
            t.href === "/app/admin"
              ? pathname === "/app/admin"
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                active
                  ? "bg-ink-900 text-white shadow-soft"
                  : "text-ink-600 hover:text-ink-900 hover:bg-orange-50"
              }`}
            >
              <Icon size={13} />
              <span className="whitespace-nowrap">{t.label}</span>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
