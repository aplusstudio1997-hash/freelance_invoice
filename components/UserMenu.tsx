"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, LogOut, ChevronDown, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-orange-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-medium shadow-soft"
      >
        <LogIn size={14} />
        <span>เข้าสู่ระบบ</span>
      </Link>
    );
  }

  const displayName =
    (user.user_metadata?.studio_name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "User";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = (displayName[0] || "U").toUpperCase();

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-1.5 py-1 hover:bg-orange-50 rounded-full transition"
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center text-xs font-semibold">
            {initial}
          </div>
        )}
        <ChevronDown size={14} className="text-ink-400 hidden sm:inline" />
      </button>

      {menuOpen && (
        <>
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-orange-100 rounded-2xl shadow-soft-lg z-[70] py-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-orange-100">
              <div className="text-xs text-ink-400 uppercase tracking-wide">
                เข้าใช้ในชื่อ
              </div>
              <div className="text-sm font-medium text-ink-900 truncate">
                {displayName}
              </div>
              {user.email && displayName !== user.email && (
                <div className="text-xs text-ink-400 truncate">
                  {user.email}
                </div>
              )}
            </div>
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-orange-50"
            >
              <Home size={14} />
              หน้าหลัก
            </Link>
            <button
              onClick={async () => {
                setMenuOpen(false);
                await signOut();
                router.push("/");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-orange-50"
            >
              <LogOut size={14} />
              ออกจากระบบ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
