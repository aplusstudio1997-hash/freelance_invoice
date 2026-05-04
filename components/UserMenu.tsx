"use client";

import { useState } from "react";
import { LogIn, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthModal from "./AuthModal";

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setAuthOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-sm font-medium"
        >
          <LogIn size={14} />
          <span>เข้าสู่ระบบ</span>
        </button>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email || "User";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = (displayName[0] || "U").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-1.5 py-1 hover:bg-gray-100 rounded-md transition"
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold">
            {initial}
          </div>
        )}
        <ChevronDown size={14} className="text-gray-400 hidden sm:inline" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs text-gray-500">เข้าใช้ในชื่อ</div>
              <div className="text-sm font-medium text-gray-800 truncate">
                {displayName}
              </div>
              {user.email && displayName !== user.email && (
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              )}
            </div>
            <button
              onClick={async () => {
                setMenuOpen(false);
                await signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
