"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Wallet,
  Users,
  Repeat,
  Briefcase,
  UserCog,
  Settings,
} from "lucide-react";

const TABS = [
  { href: "/app/dashboard", label: "ภาพรวม", icon: LayoutGrid },
  { href: "/app/finance", label: "Finance", icon: Wallet },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/app/suppliers", label: "Suppliers", icon: Briefcase },
  { href: "/app/my-data", label: "My Data", icon: UserCog },
  { href: "/app/settings", label: "ตั้งค่า", icon: Settings },
] as const;

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <div className="px-3 sm:px-6 pt-2">
      <nav className="bg-white/85 backdrop-blur border border-orange-100 rounded-full shadow-soft p-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active =
            pathname === t.href ||
            (t.href !== "/app/dashboard" && pathname.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                active
                  ? "bg-brand-500 text-white shadow-soft"
                  : "text-ink-600 hover:text-ink-900 hover:bg-orange-50"
              }`}
            >
              <Icon size={14} />
              <span className="whitespace-nowrap">{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
