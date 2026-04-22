"use client";

import {
  FORTUNES,
  EXCUSES,
  generateHellFileName,
  generateProFileName,
  FILE_TYPES,
} from "@/lib/prompts";
import { X, Dice5, RefreshCw, Wand2, MessageCircle, Folder } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "fortune" | "excuse" | "filename";

export default function StressReliefModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("fortune");
  const [fortune, setFortune] = useState(() => pickRandom(FORTUNES, ""));
  const [excuse, setExcuse] = useState("");
  const [hellName, setHellName] = useState(() => generateHellFileName());
  const [projectName, setProjectName] = useState("");
  const [fileType, setFileType] = useState("Logo");
  const [proName, setProName] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 animate-fadeIn shadow-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-brand-600">
            <span className="text-lg">😎</span>
            <h3 className="font-semibold text-lg">คลายเครียดไป</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-0 border-b border-gray-200 mb-4 -mx-1">
          <TabBtn
            icon={<Dice5 size={15} />}
            label="เสี่ยงเซียมซี"
            active={tab === "fortune"}
            onClick={() => setTab("fortune")}
          />
          <TabBtn
            icon={<MessageCircle size={15} />}
            label="ข้ออ้าง"
            active={tab === "excuse"}
            onClick={() => setTab("excuse")}
          />
          <TabBtn
            icon={<Folder size={15} />}
            label="ชื่อไฟล์นรก"
            active={tab === "filename"}
            onClick={() => setTab("filename")}
          />
        </div>

        {tab === "fortune" && (
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-5">
            <p className="text-xs text-gray-500 text-center mb-3">
              เช็คดวงชะตาการออกแบบวันนี้...
            </p>
            <div className="text-center font-medium text-gray-800 min-h-[60px] flex items-center justify-center px-2 leading-relaxed">
              {fortune}
            </div>
            <button
              onClick={() => setFortune(pickRandom(FORTUNES, fortune))}
              className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition mt-4"
            >
              <Dice5 size={15} /> เปิดใบใหม่
            </button>
          </div>
        )}

        {tab === "excuse" && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <p className="text-xs text-gray-500 text-center mb-3">
              ข้ออ้าง Professional เวลาส่งงานช้า...
            </p>
            <div className="text-center font-medium text-gray-800 min-h-[80px] flex items-center justify-center px-2 italic leading-relaxed">
              {excuse ? `"${excuse}"` : "กดปุ่มเพื่อค้นหาข้ออ้างที่เหมาะสม"}
            </div>
            <button
              onClick={() => setExcuse(pickRandom(EXCUSES, excuse))}
              className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition mt-4"
            >
              <Wand2 size={15} /> {excuse ? "สร้างใหม่" : "สร้างข้ออ้าง"}
            </button>
          </div>
        )}

        {tab === "filename" && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-500 text-center mb-2">
                ชื่อไฟล์ที่ &ldquo;เหมาะสม&rdquo; สำหรับโครงการ
              </p>
              <div className="text-xs text-gray-400 text-center mb-1">
                ชื่อไฟล์นรก:
              </div>
              <div className="bg-white border border-gray-200 rounded-md px-3 py-2.5 text-center font-mono text-sm break-all">
                {hellName}
              </div>
              <button
                onClick={() => setHellName(generateHellFileName())}
                className="w-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white py-2 rounded-md font-medium flex items-center justify-center gap-2 transition mt-3"
              >
                <RefreshCw size={14} /> สุ่มใหม่
              </button>
            </div>

            <div className="border-t border-purple-200 pt-4">
              <div className="text-xs text-gray-500 mb-2">
                ชื่อไฟล์ Professional:
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  placeholder="ชื่อโครงการ"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 text-sm"
                />
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="border border-gray-200 rounded-md px-2 py-2 bg-white text-sm"
                >
                  {FILE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              {proName && (
                <div className="bg-white border border-green-200 rounded-md px-3 py-2 text-center font-mono text-sm mb-2 break-all">
                  {proName}
                </div>
              )}
              <button
                onClick={() => setProName(generateProFileName(projectName, fileType))}
                disabled={!projectName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition"
              >
                <Wand2 size={14} /> สร้างชื่อไฟล์ Professional
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
        active
          ? "text-brand-600 border-brand-500"
          : "text-gray-500 border-transparent hover:text-gray-700"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function pickRandom(list: string[], exclude: string): string {
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  let picked = list[Math.floor(Math.random() * list.length)];
  let tries = 0;
  while (picked === exclude && tries < 5) {
    picked = list[Math.floor(Math.random() * list.length)];
    tries++;
  }
  return picked;
}
