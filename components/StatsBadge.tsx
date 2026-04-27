"use client";

interface Props {
  totalQuotes: number | null;
  activeUsers: number | null;
}

export default function StatsBadge({ totalQuotes, activeUsers }: Props) {
  if (totalQuotes === null) return null;

  return (
    <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 shrink-0">
      <span className="hidden sm:inline">
        มีฟรีแลนซ์สร้างใบเสนอราคาไปแล้ว{" "}
        <span className="font-semibold text-brand-600 tabular-nums">
          {totalQuotes.toLocaleString()}
        </span>{" "}
        ใบ
      </span>
      <span className="sm:hidden">
        สร้างไปแล้ว{" "}
        <span className="font-semibold text-brand-600 tabular-nums">
          {totalQuotes.toLocaleString()}
        </span>{" "}
        ใบ
      </span>
      {activeUsers !== null && activeUsers > 0 && (
        <span
          className="flex items-center gap-1 text-green-700"
          title={`กำลังใช้งานอยู่ ${activeUsers.toLocaleString()} คน`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span className="tabular-nums">{activeUsers.toLocaleString()}</span>
        </span>
      )}
    </div>
  );
}
