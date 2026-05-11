"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  Info,
  ArrowLeft,
} from "lucide-react";

type Mode = "login" | "signup";

export default function AuthForm() {
  const router = useRouter();
  const search = useSearchParams();
  const initialMode = (search.get("mode") as Mode) || "login";
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } =
    useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [studioName, setStudioName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/app");
  }, [user, loading, router]);

  const submit = useCallback(async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    if (mode === "signup") {
      if (password.length < 8) {
        setError("รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร");
        return;
      }
      if (!agreed) {
        setError("กรุณายอมรับนโยบาย Beta ก่อนสมัคร");
        return;
      }
    } else if (password.length < 6) {
      setError("รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, studioName.trim() || undefined);
      }
      router.replace("/app");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      if (msg.includes("Invalid login")) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (msg.includes("already registered")) {
        setError("อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }, [
    mode,
    email,
    password,
    studioName,
    agreed,
    signInWithEmail,
    signUpWithEmail,
    router,
  ]);

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-page flex flex-col">
      <div className="px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-600 transition"
        >
          <ArrowLeft size={14} />
          กลับหน้าหลัก
        </Link>
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-ink-900 text-white flex items-center justify-center font-bold text-base leading-none shadow-soft-lg">
                <span>
                  So<span className="text-brand-400">1</span>
                  <br />o
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-ink-900">So1o Freelancer</h1>
            <p className="text-xs text-ink-400 mt-0.5">หลังบ้านฟรีแลนซ์ของคุณ</p>
          </div>

          <div className="bg-white/85 backdrop-blur border border-orange-100 rounded-3xl shadow-soft-lg p-6 sm:p-7">
            <div className="bg-orange-50/60 border border-orange-100 rounded-full p-1 grid grid-cols-2 gap-1 mb-6">
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`py-2 rounded-full text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white text-ink-900 shadow-soft"
                    : "text-ink-400 hover:text-ink-600"
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`py-2 rounded-full text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white text-ink-900 shadow-soft"
                    : "text-ink-400 hover:text-ink-600"
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            <div className="space-y-4">
              {mode === "signup" && (
                <Field
                  label="ชื่อ / ชื่อร้าน"
                  icon={<User size={14} />}
                  type="text"
                  value={studioName}
                  onChange={setStudioName}
                  placeholder="Studio Mango"
                  autoComplete="organization"
                />
              )}
              <Field
                label="อีเมล"
                icon={<Mail size={14} />}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Field
                label={
                  mode === "signup" ? "รหัสผ่าน (อย่างน้อย 8 ตัว)" : "รหัสผ่าน"
                }
                icon={<Lock size={14} />}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                onEnter={submit}
              />

              {mode === "signup" ? (
                <div className="bg-orange-50/70 border border-orange-100 rounded-xl px-3.5 py-3 space-y-2.5">
                  <div className="flex gap-2">
                    <Info
                      size={14}
                      className="shrink-0 mt-0.5 text-brand-500"
                    />
                    <p className="text-[11px] text-ink-600 leading-relaxed">
                      <span className="font-semibold text-brand-700">
                        นโยบายช่วง Beta:
                      </span>{" "}
                      สิทธิ์การเข้าใช้งานมีจำนวนจำกัด เพื่อให้ระบบขับเคลื่อนได้
                      อย่างต่อเนื่อง ทีมงานขออนุญาตระงับสิทธิ์ผู้ที่ไม่มีความเคลื่อนไหวเกิน
                      7 วัน เพื่อส่งต่อโอกาสให้ผู้ที่อยู่ใน Waitlist ท่านถัดไปครับ
                    </p>
                  </div>
                  <label className="flex gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 accent-brand-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-ink-600 leading-relaxed">
                      ฉันเข้าใจและยอมรับว่าสิทธิ์การใช้งานจะถูกระงับหากไม่มีความเคลื่อนไหวเกิน
                      7 วัน
                    </span>
                  </label>
                </div>
              ) : (
                <div className="bg-orange-50/70 border border-orange-100 rounded-xl px-3.5 py-3">
                  <div className="flex gap-2">
                    <Info
                      size={14}
                      className="shrink-0 mt-0.5 text-brand-500"
                    />
                    <p className="text-[11px] text-ink-600 leading-relaxed">
                      <span className="font-semibold text-brand-700">
                        นโยบายช่วง Beta:
                      </span>{" "}
                      สิทธิ์การเข้าใช้งานมีจำนวนจำกัด ทีมงานขออนุญาตระงับ
                      สิทธิ์ผู้ที่ไม่มีความเคลื่อนไหวเกิน 7 วัน เพื่อส่งต่อโอกาสให้ผู้ที่อยู่ใน
                      Waitlist ท่านถัดไปครับ
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                onClick={submit}
                disabled={busy}
                className={`w-full py-3 rounded-full font-medium text-sm transition flex items-center justify-center gap-2 ${
                  mode === "signup"
                    ? "bg-brand-400 hover:bg-brand-500 disabled:bg-brand-300 text-white shadow-soft"
                    : "bg-ink-900 hover:bg-ink-800 disabled:bg-ink-400 text-white shadow-soft"
                }`}
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-orange-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-ink-400">หรือ</span>
                </div>
              </div>

              <button
                onClick={google}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2.5 border border-orange-100 hover:bg-peach-50/50 text-ink-700 font-medium py-3 rounded-full text-sm disabled:opacity-60 transition"
              >
                <GoogleIcon />
                {mode === "login" ? "เข้าสู่ระบบด้วย Google" : "สมัครด้วย Google"}
              </button>

              <div className="text-center text-xs text-ink-400 pt-1">
                {mode === "login" ? (
                  <>
                    ยังไม่มีบัญชี?{" "}
                    <button
                      onClick={() => {
                        setMode("signup");
                        setError(null);
                      }}
                      className="text-brand-600 hover:text-brand-700 font-medium"
                    >
                      สมัครสมาชิก
                    </button>
                  </>
                ) : (
                  <>
                    มีบัญชีอยู่แล้ว?{" "}
                    <button
                      onClick={() => {
                        setMode("login");
                        setError(null);
                      }}
                      className="text-brand-600 hover:text-brand-700 font-medium"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  onEnter,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  onEnter?: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) onEnter();
          }}
          className="w-full pl-10 pr-3.5 py-2.5 bg-orange-50/40 border border-orange-100 rounded-full text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
        />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.6l6.2 5.2C41.3 35.6 44 30.2 44 24c0-1.3-.1-2.6-.4-3.5z"
      />
    </svg>
  );
}
