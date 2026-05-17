import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type OffcanvasSide = "right" | "left";

interface AppOffcanvasProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  side?: OffcanvasSide;
  widthClassName?: string;
  overlayClassName?: string;
  contentClassName?: string;
  closeOnBackdrop?: boolean;
}

export function AppOffcanvas({
  children,
  open,
  onClose,
  side = "right",
  widthClassName = "w-80",
  overlayClassName,
  contentClassName,
  closeOnBackdrop = true,
}: AppOffcanvasProps) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0 z-50 bg-inkblack/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
          overlayClassName,
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <div
        className={cn(
          "absolute top-0 z-50 flex h-full flex-col bg-white transition-transform duration-300",
          widthClassName,
          side === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
          contentClassName,
        )}
      >
        {children}
      </div>
    </>
  );
}
