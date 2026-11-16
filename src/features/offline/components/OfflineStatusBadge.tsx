import { useState } from "react";
import { AlertTriangle, CloudUpload, RefreshCw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  selectConflictCount,
  selectPendingCount,
  useOfflineStore,
} from "../stores/offline.store";
import { OfflineQueueModal } from "./OfflineQueueModal";

const plural = (n: number, one: string, many: string) =>
  n === 1 ? `1 ${one}` : `${n} ${many}`;

/**
 * Indicador fijo del estado offline: "Sin conexión · 3 ventas pendientes".
 * No se muestra si hay conexión y la cola está vacía.
 */
export function OfflineStatusBadge() {
  const isOffline = useOfflineStore((s) => s.isOffline);
  const syncing = useOfflineStore((s) => s.syncing);
  const pending = useOfflineStore(selectPendingCount);
  const conflicts = useOfflineStore(selectConflictCount);
  const [open, setOpen] = useState(false);

  if (!isOffline && pending === 0 && conflicts === 0) return null;

  const parts: string[] = [];
  if (isOffline) parts.push("Sin conexión");
  if (pending > 0)
    parts.push(plural(pending, "venta pendiente", "ventas pendientes"));
  if (conflicts > 0) parts.push(plural(conflicts, "con conflicto", "con conflicto"));

  const Icon = conflicts > 0
    ? AlertTriangle
    : isOffline
      ? WifiOff
      : syncing
        ? RefreshCw
        : CloudUpload;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Ver ventas offline"
        className={cn(
          "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
          conflicts > 0
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : isOffline
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
              : "bg-sky-50 text-sky-800 hover:bg-sky-100",
        )}
      >
        <Icon size={13} className={cn(syncing && "animate-spin")} />
        {parts.join(" · ")}
      </button>

      {open && <OfflineQueueModal onClose={() => setOpen(false)} />}
    </>
  );
}
