"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppHeader from "@/components/app-shell/AppHeader";
import AppTabs from "@/components/app-shell/AppTabs";
import BetaBanner from "@/components/app-shell/BetaBanner";
import SchemaWarningBanner from "@/components/app-shell/SchemaWarningBanner";
import UnsavedGuard from "@/components/app-shell/UnsavedGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[100dvh] bg-app flex items-center justify-center text-sm text-ink-400">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-app pb-12">
      <UnsavedGuard />
      <AppHeader />
      <BetaBanner />
      <SchemaWarningBanner />
      <AppTabs />
      <main className="px-3 sm:px-6 pt-4 sm:pt-6">{children}</main>
    </div>
  );
}
