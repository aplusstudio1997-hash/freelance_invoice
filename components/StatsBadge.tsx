"use client";

interface Props {
  totalQuotes: number | null;
  activeUsers: number | null;
}

export default function StatsBadge({ totalQuotes, activeUsers }: Props) {
  if (totalQuotes === null) return null;

  return (
    <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 bg-brand-50 border border-brand-100 rounded-md">
      <span className="text-[10px] sm:text-xs text-gray-700">
        มีฟรีแลนซ์สร้างใบเสนอราคาไปแล้ว{" "}
        <span className="font-semibold text-brand-600 tabular-nums">
          {totalQuotes.toLocaleString()}
        </span>{" "}
        ใบ
      </span>
      {activeUsers !== null && activeUsers > 0 && (
        <>
          <span className="w-px h-3 bg-brand-200" />
          <span
            className="flex items-center gap-1 text-green-700 text-[10px] sm:text-xs"
            title={`กำลังใช้งานอยู่ ${activeUsers.toLocaleString()} คน`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            <span className="tabular-nums">{activeUsers.toLocaleString()}</span>
          </span>
        </>
      )}
    </div>
  );
}
