// src/components/shared/PageHeader.tsx
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "px-5 py-3 border-b border-surface bg-white flex items-center justify-between flex-shrink-0",
        className,
      )}
    >
      <div>
        <h1 className="text-lg font-semibold text-inkblack">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
