import { Suspense } from "react";
import AuthForm from "./AuthForm";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm />
    </Suspense>
  );
}

function AuthFallback() {
  return (
    <div className="min-h-[100dvh] bg-page flex items-center justify-center">
      <div className="text-sm text-ink-400">กำลังโหลด...</div>
    </div>
  );
}
