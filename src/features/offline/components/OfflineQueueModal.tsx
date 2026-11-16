import { useState } from "react";
import { AlertTriangle, Clock, RefreshCw, Trash2, WifiOff } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { PaymentMethodEnum } from "@/constants";
import { formatLocalDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/utils";
import { PAYMENT_LABELS } from "@/utils/generalStatus/sale-display";
import { offlineQueue } from "../services/offline-queue";
import { syncOfflineQueue } from "../services/offline-sync.service";
import { probeConnection } from "../services/connectivity";
import { useOfflineStore } from "../stores/offline.store";

interface OfflineQueueModalProps {
  onClose: () => void;
}

/**
 * Ventas offline del cajero que aún no están en el servidor: pendientes de
 * envío y con conflicto (rechazadas sin posibilidad de reintento).
 */
export function OfflineQueueModal({ onClose }: OfflineQueueModalProps) {
  const sales = useOfflineStore((s) => s.sales);
  const syncing = useOfflineStore((s) => s.syncing);
  const isOffline = useOfflineStore((s) => s.isOffline);
  const [confirmDiscard, setConfirmDiscard] = useState<string | null>(null);

  async function handleSyncNow() {
    if (useOfflineStore.getState().isOffline) {
      const online = await probeConnection();
      if (!online) return;
    }
    await syncOfflineQueue();
  }

  async function handleDiscard(id: string) {
    await offlineQueue.remove(id);
    await useOfflineStore.getState().refresh();
    setConfirmDiscard(null);
  }

  return (
    <AppModal size="lg" onClose={onClose} closeOnBackdrop>
      <PanelHeader
        icon={WifiOff}
        title="Ventas offline"
        description={
          isOffline
            ? "Sin conexión. Las ventas se envían solas cuando vuelve."
            : "Ventas registradas sin conexión que aún no llegan al servidor."
        }
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {sales.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-muted-foreground">
            No hay ventas offline pendientes.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sales.map((sale) => {
              const isConflict = sale.status === "CONFLICT";
              return (
                <li
                  key={sale.id}
                  className={
                    isConflict
                      ? "rounded-xl border border-red-200 bg-red-50/60 px-3 py-2.5"
                      : "rounded-xl border border-surface bg-white px-3 py-2.5"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[12px] font-medium text-inkblack">
                        {sale.ticketCode}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatLocalDateTime(sale.occurredAt)} ·{" "}
                        {PAYMENT_LABELS[sale.paymentMethod as PaymentMethodEnum]}
                        {sale.customerName ? ` · ${sale.customerName}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[13px] font-semibold tabular-nums text-inkblack">
                        {formatMoney(sale.total)}
                      </span>
                      {isConflict ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          <AlertTriangle size={10} />
                          Con conflicto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          <Clock size={10} />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  {isConflict && (
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p className="text-[11px] text-red-700">
                        {sale.lastMessage ?? "El servidor rechazó la venta."}
                        {sale.lastErrorCode && (
                          <span className="ml-1 font-mono text-[10px] text-red-500">
                            ({sale.lastErrorCode})
                          </span>
                        )}
                      </p>
                      {confirmDiscard === sale.id ? (
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setConfirmDiscard(null)}
                          >
                            No
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => void handleDiscard(sale.id)}
                          >
                            Sí, descartar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => setConfirmDiscard(sale.id)}
                        >
                          <Trash2 size={11} />
                          Descartar
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {sales.some((s) => s.status === "CONFLICT") && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Una venta con conflicto no se va a registrar aunque se reintente.
            Avisa al administrador y guarda la ficha impresa: descartarla la
            quita de este equipo, pero el cobro ya se hizo y habrá que
            registrarlo o justificarlo a mano.
          </p>
        )}
      </div>

      <PanelFooter align="right">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          onClick={() => void handleSyncNow()}
          isLoading={syncing}
          loadingText="Sincronizando..."
          disabled={!sales.some((s) => s.status === "PENDING")}
        >
          <RefreshCw size={13} />
          Sincronizar ahora
        </Button>
      </PanelFooter>
    </AppModal>
  );
}
