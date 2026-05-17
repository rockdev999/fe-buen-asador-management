// src/components/shared/Overlay/PanelFooter.tsx

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelFooterAlign = "between" | "right" | "left" | "stack";

interface PanelFooterProps {
  children: ReactNode;
  className?: string;
  align?: PanelFooterAlign;
}

const ALIGN_CLASSES: Record<PanelFooterAlign, string> = {
  between: "items-center justify-between",
  right: "items-center justify-end",
  left: "items-center justify-start",
  stack: "flex-col",
};

export function PanelFooter({
  children,
  className,
  align = "between",
}: PanelFooterProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-2 border-t border-surface bg-white px-5 py-3",
        ALIGN_CLASSES[align],
        className,
      )}
    >
      {children}
    </div>
  );
}
