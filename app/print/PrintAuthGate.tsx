"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function PrintAuthGate({
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
      <div className="min-h-[100dvh] flex items-center justify-center text-sm text-gray-500">
        กำลังโหลด...
      </div>
    );
  }

  return <>{children}</>;
}
