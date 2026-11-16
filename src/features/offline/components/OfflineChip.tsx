import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marca una venta registrada sin conexión. */
export function OfflineChip({ className }: { className?: string }) {
  return (
    <span
      title="Venta registrada sin conexión y sincronizada después"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600",
        className,
      )}
    >
      <WifiOff size={10} />
      Offline
    </span>
  );
}
