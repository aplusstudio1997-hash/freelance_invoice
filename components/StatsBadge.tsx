"use client";

import { FileText, Users } from "lucide-react";

interface Props {
  totalQuotes: number | null;
  activeUsers: number | null;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function StatsBadge({ totalQuotes, activeUsers }: Props) {
  if (totalQuotes === null && activeUsers === null) return null;

  return (
    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
      {totalQuotes !== null && (
        <div
          className="flex items-center gap-1 px-2 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-medium"
          title={`สร้างใบเสนอราคาไปแล้ว ${totalQuotes.toLocaleString()} ใบ`}
        >
          <FileText size={11} />
          <span className="tabular-nums">{formatCount(totalQuotes)}</span>
        </div>
      )}
      {activeUsers !== null && activeUsers > 0 && (
        <div
          className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-medium"
          title={`กำลังใช้งานอยู่ ${activeUsers.toLocaleString()} คน`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <Users size={11} />
          <span className="tabular-nums">{formatCount(activeUsers)}</span>
        </div>
      )}
    </div>
  );
}
