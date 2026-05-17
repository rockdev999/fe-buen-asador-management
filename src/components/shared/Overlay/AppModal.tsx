import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";
type AppModalPosition = "fixed" | "absolute";

interface AppModalProps {
  children: ReactNode;
  open?: boolean;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  size?: AppModalSize;
  position?: AppModalPosition;
  overlayClassName?: string;
  contentClassName?: string;
  maxHeightClassName?: string;
}

const MODAL_SIZE_CLASSES: Record<AppModalSize, string> = {
  xs: "w-80",
  sm: "w-[380px]",
  md: "w-[500px]",
  lg: "w-full max-w-lg",
  xl: "w-full max-w-2xl",
  full: "w-full",
};

export function AppModal({
  children,
  open = true,
  onClose,
  closeOnBackdrop = false,
  size = "md",
  position = "fixed",
  overlayClassName,
  contentClassName,
  maxHeightClassName = "max-h-[88vh]",
}: AppModalProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        position === "fixed" ? "fixed" : "absolute",
        "inset-0 z-50 flex items-center justify-center bg-inkblack/50 p-4 backdrop-blur-[2px]",
        overlayClassName,
      )}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
          MODAL_SIZE_CLASSES[size],
          maxHeightClassName,
          contentClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
