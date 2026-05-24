import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface PanelHeaderProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  onClose?: () => void;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closeLabel?: string;
}

export function PanelHeader({
  title,
  description,
  icon: Icon,
  onClose,
  actions,
  className,
  titleClassName,
  descriptionClassName,
  closeLabel = "Cerrar",
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 border-b border-surface px-5 py-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon size={17} />
          </div>
        )}

        <div className="min-w-0">
          <h2
            className={cn(
              "truncate text-sm font-semibold text-inkblack",
              titleClassName,
            )}
          >
            {title}
          </h2>

          {description && (
            <p
              className={cn(
                "mt-0.5 text-[11px] text-muted-foreground",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
            aria-label={closeLabel}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
