"use client";

import { useEffect, useRef } from "react";

export function useModalDismiss(
  onClose: () => void,
  options: { open?: boolean } = {}
) {
  const { open = true } = options;
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      }
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return {
    onBackdropClick: (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) closeRef.current();
    },
  };
}
