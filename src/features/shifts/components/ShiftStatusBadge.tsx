import { ShiftStatusEnum } from "@/constants";
import { cn } from "@/lib/utils";
import {
  SHIFT_STATUS_COLORS,
  SHIFT_STATUS_LABELS,
} from "@/utils/generalStatus/shift-display";

export function ShiftStatusBadge({ status }: { status: ShiftStatusEnum }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap",
        SHIFT_STATUS_COLORS[status] ?? "bg-surface text-muted-foreground",
      )}
    >
      {SHIFT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
