"use client";

import { useEffect, useRef } from "react";
import { Calendar, Clock } from "lucide-react";
import flatpickr from "flatpickr";
import { Thai } from "flatpickr/dist/l10n/th.js";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.min.css";

interface Props {
  value: string;
  onChange: (v: string) => void;
  withTime?: boolean;
  timeOnly?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateToIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dateToTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateToIsoTime(d: Date): string {
  return `${dateToIso(d)} ${dateToTime(d)}`;
}

export default function FlatpickrInput({
  value,
  onChange,
  withTime = false,
  timeOnly = false,
  className = "",
  placeholder,
  required,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<Instance | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!inputRef.current) return;
    const fp = flatpickr(inputRef.current, {
      locale: Thai,
      allowInput: true,
      time_24hr: true,
      enableTime: withTime || timeOnly,
      noCalendar: timeOnly,
      // Single input — no altInput — display in Thai-friendly format and
      // convert back to ISO ourselves so external onChange always sees ISO.
      dateFormat: timeOnly ? "H:i" : withTime ? "j M Y H:i" : "j M Y",
      onChange: (dates) => {
        if (!dates.length) {
          onChangeRef.current("");
          return;
        }
        const d = dates[0];
        onChangeRef.current(
          timeOnly
            ? dateToTime(d)
            : withTime
              ? dateToIsoTime(d)
              : dateToIso(d)
        );
      },
    }) as Instance;
    fpRef.current = fp;
    return () => {
      fp.destroy();
      fpRef.current = null;
    };
  }, [withTime, timeOnly]);

  useEffect(() => {
    const fp = fpRef.current;
    if (!fp) return;
    if (value) {
      // Accept ISO ("2026-05-17" or "2026-05-17 14:30") and time ("14:30").
      fp.setDate(value, false);
    } else {
      fp.clear(false);
    }
  }, [value]);

  const Icon = timeOnly ? Clock : Calendar;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || (timeOnly ? "HH:mm" : "เลือกวันที่")}
        required={required}
        disabled={disabled}
        className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-200 tabular-nums cursor-pointer disabled:opacity-50 text-sm"
      />
      <Icon
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
