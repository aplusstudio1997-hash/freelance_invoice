"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Clock,
  Target,
  Wand2,
} from "lucide-react";
import { fmtMoney } from "@/lib/finance-utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;

const WORK_TYPES = [
  { id: "logo", label: "Logo / Branding" },
  { id: "social", label: "Social Media Design" },
  { id: "web", label: "Web Design / UI" },
  { id: "video", label: "วิดีโอ / Motion" },
  { id: "photo", label: "ถ่ายภาพ" },
  { id: "writing", label: "งานเขียน / Copy" },
  { id: "code", label: "Development" },
  { id: "other", label: "อื่น ๆ" },
] as const;

const COMPLEXITY = [
  { id: "simple", label: "ง่าย", desc: "เร็ว ตรง ๆ" },
  { id: "medium", label: "กลาง", desc: "ต้องคิด revise" },
  { id: "complex", label: "ซับซ้อน", desc: "หลาย stakeholder" },
] as const;

const URGENCY = [
  { id: "flexible", label: "ยืดหยุ่น", desc: "ไม่รีบ" },
  { id: "normal", label: "ปกติ", desc: "2-4 สัปดาห์" },
  { id: "rush", label: "เร่งด่วน", desc: "ภายในสัปดาห์" },
] as const;

export default function AiPriceCheckModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [workType, setWorkType] = useState<string>("logo");
  const [complexity, setComplexity] = useState<string>("medium");
  const [urgency, setUrgency] = useState<string>("normal");

  if (!open) return null;

  const reset = () => {
    setStep(1);
    setWorkType("logo");
    setComplexity("medium");
    setUrgency("normal");
  };

  const close = () => {
    reset();
    onClose();
  };

  const estimate = mockEstimate(workType, complexity, urgency);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-lg shadow-soft-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center shadow-glow">
              <Sparkles size={15} />
            </div>
            <div>
              <h3 className="font-semibold text-ink-900">
                AI Quick Price Check
              </h3>
              <div className="text-[10px] text-ink-400">
                ขั้นตอน {step} / 3
              </div>
            </div>
          </div>
          <button
            onClick={close}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-full hover:bg-orange-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-3 pb-2 border-b border-orange-100">
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`flex-1 h-1 rounded-full transition ${
                  n <= step ? "bg-brand-500" : "bg-orange-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-5 py-5 overflow-y-auto flex-1 scrollbar-thin">
          {step === 1 && (
            <StepBlock
              icon={<Briefcase size={16} />}
              title="งานประเภทไหน?"
              subtitle="เลือกประเภทงานที่ลูกค้าจ้าง"
            >
              <div className="grid grid-cols-2 gap-2">
                {WORK_TYPES.map((t) => (
                  <OptionCard
                    key={t.id}
                    active={workType === t.id}
                    onClick={() => setWorkType(t.id)}
                    label={t.label}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock
              icon={<Target size={16} />}
              title="ระดับความซับซ้อน?"
              subtitle="ประเมินงานนี้ใช้ความคิด/เวลามากแค่ไหน"
            >
              <div className="space-y-2">
                {COMPLEXITY.map((c) => (
                  <OptionRow
                    key={c.id}
                    active={complexity === c.id}
                    onClick={() => setComplexity(c.id)}
                    label={c.label}
                    desc={c.desc}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock
              icon={<Clock size={16} />}
              title="เร่งด่วนแค่ไหน?"
              subtitle="ระยะเวลาส่งงาน"
            >
              <div className="space-y-2">
                {URGENCY.map((u) => (
                  <OptionRow
                    key={u.id}
                    active={urgency === u.id}
                    onClick={() => setUrgency(u.id)}
                    label={u.label}
                    desc={u.desc}
                  />
                ))}
              </div>
            </StepBlock>
          )}

          {step === 4 && (
            <div className="text-center py-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white flex items-center justify-center shadow-glow mb-3">
                <Wand2 size={22} />
              </div>
              <h3 className="font-semibold text-ink-900">ราคาที่แนะนำ</h3>
              <div className="text-[11px] text-ink-400 mb-4">
                อ้างอิงราคาตลาดฟรีแลนซ์ไทย (ประมาณการ)
              </div>

              <div className="bg-gradient-to-br from-ink-900 to-ink-800 text-white rounded-3xl p-5 shadow-soft-lg">
                <div className="text-[11px] text-white/70 uppercase tracking-wide">
                  ช่วงราคาที่เหมาะสม
                </div>
                <div className="text-3xl font-bold mt-1 tabular-nums">
                  ฿{fmtMoney(estimate.low)} – ฿{fmtMoney(estimate.high)}
                </div>
                <div className="text-xs text-white/60 mt-2">
                  ค่ากลาง: ฿{fmtMoney(estimate.mid)}
                </div>
                <div className="border-t border-white/10 my-3" />
                <div className="text-left space-y-1.5 text-xs">
                  <ResultLine
                    label="หลังหัก WHT 3%"
                    value={`฿${fmtMoney(estimate.mid * 0.97)}`}
                  />
                  <ResultLine
                    label="ถ้าจด VAT 7%"
                    value={`฿${fmtMoney(estimate.mid * 1.07)}`}
                  />
                </div>
              </div>

              <div className="mt-4 text-left bg-orange-50/50 border border-orange-100 rounded-2xl p-3 text-[11px] text-ink-600 leading-relaxed">
                <div className="font-semibold text-brand-700 mb-1 flex items-center gap-1">
                  <Sparkles size={11} />
                  เทียบกับงาน {WORK_TYPES.find((w) => w.id === workType)?.label}
                </div>
                ราคานี้เป็นการประมาณการเบื้องต้นเท่านั้น —
                ปัจจัยจริงเช่น ลูกค้า ขนาดงาน scope ส่งงาน revise ที่ตกลงกัน
                อาจทำให้ราคาแตกต่างไป
              </div>

              <div className="mt-3 text-[11px] text-ink-400 bg-orange-50/40 rounded-2xl px-3 py-2 inline-flex items-center gap-1.5">
                <span className="text-brand-500 font-semibold">เร็ว ๆ นี้:</span>
                เชื่อม AI จริง + ดึงข้อมูลตลาดล่าสุด
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-orange-100 flex gap-2">
          {step < 4 ? (
            <>
              {step > 1 ? (
                <button
                  onClick={() => setStep((step - 1) as Step)}
                  className="px-4 py-2.5 rounded-full border border-orange-200 text-ink-700 hover:bg-orange-50 text-sm font-medium transition flex items-center gap-1"
                >
                  <ChevronLeft size={13} />
                  ย้อน
                </button>
              ) : (
                <div className="flex-1" />
              )}
              <div className="flex-1" />
              <button
                onClick={() => setStep((step + 1) as Step)}
                className="px-5 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-medium transition flex items-center gap-1"
              >
                {step === 3 ? "ดูผลลัพธ์" : "ถัดไป"}
                <ChevronRight size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={reset}
                className="flex-1 py-2.5 rounded-full border border-orange-200 text-ink-700 hover:bg-orange-50 text-sm font-medium transition"
              >
                ประเมินใหม่
              </button>
              <button
                onClick={close}
                className="flex-1 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition shadow-soft"
              >
                ปิด
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBlock({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
          {icon}
        </div>
        <h4 className="font-semibold text-ink-900">{title}</h4>
      </div>
      <div className="text-xs text-ink-400 ml-9 mb-4">{subtitle}</div>
      {children}
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-2xl border-2 text-sm font-medium transition text-left ${
        active
          ? "border-brand-500 bg-orange-50 text-brand-700"
          : "border-orange-100 hover:border-brand-200 text-ink-700"
      }`}
    >
      {label}
    </button>
  );
}

function OptionRow({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
        active
          ? "border-brand-500 bg-orange-50"
          : "border-orange-100 hover:border-brand-200"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 shrink-0 ${
          active ? "border-brand-500 bg-brand-500" : "border-ink-200"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium ${
            active ? "text-brand-700" : "text-ink-900"
          }`}
        >
          {label}
        </div>
        <div className="text-[11px] text-ink-400">{desc}</div>
      </div>
    </button>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-white/85">
      <span className="text-white/70">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}

function mockEstimate(
  workType: string,
  complexity: string,
  urgency: string
): { low: number; mid: number; high: number } {
  const baseByType: Record<string, number> = {
    logo: 8000,
    social: 4500,
    web: 35000,
    video: 25000,
    photo: 15000,
    writing: 6000,
    code: 45000,
    other: 10000,
  };
  const complexityMult: Record<string, number> = {
    simple: 0.75,
    medium: 1.0,
    complex: 1.6,
  };
  const urgencyMult: Record<string, number> = {
    flexible: 0.95,
    normal: 1.0,
    rush: 1.35,
  };
  const base =
    (baseByType[workType] ?? 10000) *
    (complexityMult[complexity] ?? 1) *
    (urgencyMult[urgency] ?? 1);
  return {
    low: Math.round(base * 0.85),
    mid: Math.round(base),
    high: Math.round(base * 1.25),
  };
}
