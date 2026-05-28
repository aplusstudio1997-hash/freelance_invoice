"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDocuments } from "@/lib/documents";
import { useModalDismiss } from "@/lib/useModalDismiss";

// Warns before the in-progress document is left while a save is still pending.
// Two layers:
//  1. beforeunload — closing/refreshing the browser tab (native browser prompt)
//  2. in-app <Link> clicks — a 3-way dialog (save / don't save / cancel)
export default function UnsavedGuard() {
  const { saveStatus, flushSave } = useDocuments();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ref so the always-on listeners read the latest dirty state without rebinding
  const dirtyRef = useRef(false);
  dirtyRef.current = saveStatus === "saving";

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const dest = url.pathname + url.search + url.hash;
      const current =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      if (dest === current) return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(dest);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const cancel = useCallback(() => setPendingHref(null), []);

  const go = useCallback(
    (href: string) => {
      setPendingHref(null);
      router.push(href);
    },
    [router]
  );

  const saveAndGo = useCallback(async () => {
    if (!pendingHref) return;
    const href = pendingHref;
    setSaving(true);
    try {
      await flushSave();
    } catch (err) {
      console.error("flushSave failed", err);
    } finally {
      setSaving(false);
    }
    go(href);
  }, [pendingHref, flushSave, go]);

  return (
    <ConfirmDialog
      open={!!pendingHref}
      saving={saving}
      onSave={saveAndGo}
      onDiscard={() => pendingHref && go(pendingHref)}
      onCancel={cancel}
    />
  );
}

function ConfirmDialog({
  open,
  saving,
  onSave,
  onDiscard,
  onCancel,
}: {
  open: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  useModalDismiss(onCancel, { open: open && !saving });

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-[120] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full sm:max-w-sm shadow-soft-lg p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-ink-900">
              ยังไม่ได้บันทึกเอกสาร
            </h3>
            <p className="text-sm text-ink-600 mt-1">
              เอกสารนี้กำลังบันทึกอยู่ ต้องการบันทึกให้เสร็จก่อนออกจากหน้านี้ไหม?
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium transition shadow-soft"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            บันทึกแล้วไปต่อ
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex-1 py-2.5 rounded-full border border-orange-200 text-ink-700 hover:bg-orange-50 disabled:opacity-60 text-sm font-medium transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={onDiscard}
              disabled={saving}
              className="flex-1 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 text-sm font-medium transition"
            >
              ไม่บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
