"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Props {
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({ onClose, initialMode = "login" }: Props) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
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
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setError(msg);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white sm:rounded-xl rounded-t-xl w-full sm:max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <button
            onClick={google}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-md text-sm disabled:opacity-60"
          >
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
            ดำเนินการต่อด้วย Google
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">หรือ</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="อย่างน้อย 6 ตัว"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
          </button>

          <div className="text-center text-xs text-gray-500 pt-1">
            {mode === "login" ? (
              <>
                ยังไม่มีบัญชี?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  สมัครเลย
                </button>
              </>
            ) : (
              <>
                มีบัญชีแล้ว?{" "}
                <button
                  onClick={() => setMode("login")}
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
  );
}
