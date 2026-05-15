"use client";

import { useEffect, useMemo, useState } from "react";
import { listAllUsers, AdminUserSummary } from "@/lib/admin";
import { fmtMoney, fmtDateDisplay, downloadCsv } from "@/lib/finance-utils";
import {
  Users,
  Search,
  Loader2,
  Download,
  Shield,
  User,
  FileText,
  Wallet,
  Clock,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<
    "created_desc" | "docs_desc" | "income_desc" | "active_desc"
  >("created_desc");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listAllUsers();
        if (!cancelled) setUsers(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? users.filter(
          (u) =>
            u.studio_name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.user_id.toLowerCase().includes(q)
        )
      : [...users];
    list.sort((a, b) => {
      if (sort === "docs_desc") return b.document_count - a.document_count;
      if (sort === "income_desc") return b.income_total - a.income_total;
      if (sort === "active_desc") {
        const aT = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
        const bT = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
        return bT - aT;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    return list;
  }, [users, search, sort]);

  const exportCsv = () => {
    const rows: string[][] = [
      [
        "user_id",
        "studio_name",
        "email",
        "role",
        "created_at",
        "documents",
        "clients",
        "income_total",
        "expense_total",
        "last_active_at",
      ],
      ...filtered.map((u) => [
        u.user_id,
        u.studio_name,
        u.email,
        u.role,
        u.created_at,
        String(u.document_count),
        String(u.client_count),
        String(u.income_total),
        String(u.expense_total),
        u.last_active_at || "",
      ]),
    ];
    downloadCsv(
      `users-${new Date().toISOString().slice(0, 10)}.csv`,
      rows
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft p-4 sm:p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่อ Studio, อีเมล, หรือ user_id"
              className="w-full pl-9 pr-3.5 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="px-3.5 py-2 bg-orange-50/40 border border-orange-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white cursor-pointer"
          >
            <option value="created_desc">ใหม่สุด</option>
            <option value="active_desc">ใช้งานล่าสุด</option>
            <option value="docs_desc">เอกสารเยอะสุด</option>
            <option value="income_desc">รายได้เยอะสุด</option>
          </select>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-white text-xs font-medium transition shadow-soft"
          >
            <Download size={12} />
            CSV
          </button>
        </div>
      </section>

      <section className="bg-white/85 backdrop-blur border border-orange-100/80 rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">
            <Loader2 size={14} className="animate-spin mr-2" />
            กำลังโหลด...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-ink-400">
            ไม่พบผู้ใช้
          </div>
        ) : (
          <div className="divide-y divide-orange-100">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 bg-orange-50/40 text-xs uppercase tracking-wide text-ink-400 font-medium">
              <div className="col-span-4">ผู้ใช้</div>
              <div className="col-span-2 text-right">เอกสาร / ลูกค้า</div>
              <div className="col-span-3 text-right">รายได้รวม</div>
              <div className="col-span-2 text-right">Active ล่าสุด</div>
              <div className="col-span-1 text-right">Role</div>
            </div>
            {filtered.map((u) => (
              <div
                key={u.user_id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 sm:px-5 py-3 hover:bg-orange-50/30 transition"
              >
                <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      u.role === "admin"
                        ? "bg-ink-900 text-white"
                        : "bg-gradient-to-br from-brand-500 to-brand-400 text-white"
                    }`}
                  >
                    {(u.studio_name[0] || "U").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900 text-sm truncate">
                      {u.studio_name}
                    </div>
                    <div className="text-xs text-ink-400 truncate">
                      {u.email}
                    </div>
                    <div className="text-xs text-ink-300 truncate font-mono">
                      {u.user_id.slice(0, 12)}...
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2 sm:text-right flex sm:block items-center gap-3">
                  <div className="flex items-center sm:justify-end gap-1 text-xs text-ink-700">
                    <FileText size={11} className="text-ink-400" />
                    <span className="tabular-nums font-medium">
                      {u.document_count}
                    </span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1 text-xs text-ink-500 sm:mt-0.5">
                    <User size={11} className="text-ink-400" />
                    <span className="tabular-nums">{u.client_count}</span>
                  </div>
                </div>
                <div className="sm:col-span-3 sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1 text-sm text-green-700 font-medium tabular-nums">
                    <Wallet size={11} />฿{fmtMoney(u.income_total)}
                  </div>
                  <div className="text-xs text-ink-400 sm:mt-0.5 tabular-nums">
                    จ่าย ฿{fmtMoney(u.expense_total)}
                  </div>
                </div>
                <div className="sm:col-span-2 sm:text-right flex sm:block items-center gap-1 text-xs text-ink-500">
                  {u.last_active_at ? (
                    <span className="inline-flex items-center sm:justify-end gap-1">
                      <Clock size={10} />
                      {fmtDateDisplay(u.last_active_at)}
                    </span>
                  ) : (
                    <span className="text-ink-300 italic">ยังไม่เคย</span>
                  )}
                  <div className="text-xs text-ink-400 sm:mt-0.5">
                    สมัคร {fmtDateDisplay(u.created_at)}
                  </div>
                </div>
                <div className="sm:col-span-1 sm:text-right">
                  {u.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-ink-900 text-white font-medium">
                      <Shield size={9} />
                      Admin
                    </span>
                  ) : (
                    <span className="text-xs text-ink-400">User</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="text-xs text-ink-400 text-center">
        เปลี่ยน role ของ user ได้โดยรัน SQL ใน Supabase:{" "}
        <code className="bg-orange-50 px-1.5 py-0.5 rounded">
          update profiles set role=&apos;admin&apos; where user_id=&apos;...&apos;
        </code>
      </div>
    </div>
  );
}
