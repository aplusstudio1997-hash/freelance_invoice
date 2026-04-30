"use client";

import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function displayToIso(display: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(display.trim());
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  const mm = String(mo).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function formatAsType(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function DateInput({
  value,
  onChange,
  className = "",
  placeholder = "dd/mm/yyyy",
}: Props) {
  const [display, setDisplay] = useState(isoToDisplay(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(isoToDisplay(value));
  }, [value, focused]);

  const commit = (text: string) => {
    const iso = displayToIso(text);
    if (iso) {
      onChange(iso);
      setDisplay(isoToDisplay(iso));
    } else if (text.trim() === "") {
      onChange("");
      setDisplay("");
    } else {
      setDisplay(isoToDisplay(value));
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={(e) => setDisplay(formatAsType(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          commit(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-full border border-gray-200 rounded-md pl-3 pr-10 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 tabular-nums"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center pointer-events-none text-gray-400">
        <Calendar size={16} />
      </div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="เลือกวันที่"
        className="absolute right-0 top-0 h-full w-10 opacity-0 cursor-pointer"
        style={{ colorScheme: "light" }}
      />
    </div>
  );
}
