import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryStatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function SummaryStat({
  label,
  value,
  hint,
  className,
}: SummaryStatProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface bg-white px-3.5 py-3",
        className,
      )}
    >
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-inkblack">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
