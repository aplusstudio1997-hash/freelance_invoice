"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { QuoteSettings, DEFAULT_QUOTE } from "@/lib/types";
import { loadDraft, saveDraft, clearDraft } from "@/lib/storage";
import { calculate } from "@/lib/calc";
import SettingsPanel from "@/components/SettingsPanel";
import ServicesPanel from "@/components/ServicesPanel";
import TimelinePanel from "@/components/TimelinePanel";
import QuotePreview from "@/components/QuotePreview";
import RandomPromptModal from "@/components/RandomPromptModal";
import StressReliefModal from "@/components/StressReliefModal";
import { Dice5, Smile, RotateCcw, Save } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<QuoteSettings>(DEFAULT_QUOTE);
  const [hydrated, setHydrated] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [reliefOpen, setReliefOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(loadDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus("saving");
    const t = setTimeout(() => {
      saveDraft(data);
      setSaveStatus("saved");
      const t2 = setTimeout(() => setSaveStatus(""), 1500);
      return () => clearTimeout(t2);
    }, 500);
    return () => clearTimeout(t);
  }, [data, hydrated]);

  const update = useCallback((patch: Partial<QuoteSettings>) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  const calc = useMemo(() => calculate(data), [data]);

  const resetAll = () => {
    if (confirm("ล้างข้อมูลทั้งหมดและเริ่มใหม่?")) {
      clearDraft();
      setData(DEFAULT_QUOTE);
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const node = previewRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxW = pdfWidth - margin * 2;
      const imgRatio = canvas.height / canvas.width;
      let imgW = maxW;
      let imgH = imgW * imgRatio;

      if (imgH > pdfHeight - margin * 2) {
        imgH = pdfHeight - margin * 2;
        imgW = imgH / imgRatio;
      }

      const x = (pdfWidth - imgW) / 2;
      pdf.addImage(imgData, "PNG", x, margin, imgW, imgH);

      const projectSlug =
        data.projectName.replace(/[^ก-๙a-zA-Z0-9]/g, "_").slice(0, 30) ||
        "quote";
      pdf.save(`${projectSlug}_${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถสร้าง PDF ได้ · ลองอีกครั้ง");
    } finally {
      setDownloading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
            F
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-800 truncate">FreelanceSolo</h1>
              <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-semibold">
                BETA
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์อย่างง่าย
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Save size={12} />
              {saveStatus === "saving" ? "กำลังบันทึก..." : "บันทึกแล้ว"}
            </span>
          )}
          <button
            onClick={() => setPromptOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-full text-sm transition"
          >
            <Dice5 size={14} /> <span className="hidden sm:inline">สุ่มโจทย์</span>
          </button>
          <button
            onClick={() => setReliefOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-200 text-brand-600 hover:bg-brand-50 rounded-full text-sm transition"
          >
            <Smile size={14} /> <span className="hidden sm:inline">คลายเครียด</span>
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full text-sm transition"
            title="เริ่มใหม่"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        <SettingsPanel data={data} update={update} />
        <ServicesPanel data={data} update={update} />
        <TimelinePanel data={data} update={update} calc={calc} />
        <QuotePreview
          ref={previewRef}
          data={data}
          calc={calc}
          onDownload={downloadPDF}
          downloading={downloading}
        />
      </main>

      <RandomPromptModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
      />
      <StressReliefModal
        open={reliefOpen}
        onClose={() => setReliefOpen(false)}
      />
    </div>
  );
}
