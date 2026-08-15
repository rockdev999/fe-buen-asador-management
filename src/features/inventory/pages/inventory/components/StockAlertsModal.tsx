import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { FormSwitch } from "@/components/shared/Basics/FormSwitch";
import { formatLocalDateTimeShort } from "@/lib/formatters";
import { useResolveStockAlert, useStockAlertsHandler } from "../../../hooks/useInventory";

interface StockAlertsModalProps {
  locationId: string;
  onClose: () => void;
}

export const StockAlertsModal = ({ locationId, onClose }: StockAlertsModalProps) => {
  const [showResolved, setShowResolved] = useState(false);

  const { data: alerts, status } = useStockAlertsHandler(locationId, showResolved);
  const {
    mutate: resolveAlert,
    isPending: isResolving,
    variables: resolvingAlertId,
  } = useResolveStockAlert();

  const isLoading = status === "pending";
  const isEmpty = !isLoading && (!alerts || alerts.length === 0);

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[85vh]" contentClassName="max-w-lg">
      <PanelHeader
        icon={AlertTriangle}
        title="Alertas de stock"
        description="Productos por debajo del stock mínimo establecido."
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <FormSwitch
          label="Mostrar alertas resueltas"
          description="Incluye alertas que ya fueron atendidas anteriormente."
          checked={showResolved}
          onChange={setShowResolved}
        />

        <div className="mt-3 flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-surface animate-pulse" />
            ))
          ) : isEmpty ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-inkblack/70">
                  Sin alertas de stock
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {showResolved
                    ? "No hay alertas registradas para esta sucursal."
                    : "Todos los productos están dentro de su stock mínimo."}
                </p>
              </div>
            </div>
          ) : (
            alerts!.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-surface bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-inkblack truncate">
                      {alert.product.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {alert.location.name} · {alert.currentQuantity}/
                      {alert.minimumStock} unidades
                    </p>
                  </div>

                  {alert.isResolved ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                      <CheckCircle2 size={11} />
                      Resuelta
                    </span>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      isLoading={isResolving && resolvingAlertId === alert.id}
                      disabled={isResolving && resolvingAlertId !== alert.id}
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between rounded-lg bg-surface/40 px-2.5 py-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {alert.isResolved ? "Resuelta" : "Detectada"}
                  </p>
                  <p className="text-[11px] font-medium text-inkblack">
                    {alert.isResolved && alert.resolvedAt
                      ? formatLocalDateTimeShort(alert.resolvedAt)
                      : formatLocalDateTimeShort(alert.createdAt)}
                    {alert.isResolved && alert.resolvedBy && ` · ${alert.resolvedBy.name}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PanelFooter align="right">
        <Button type="button" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </PanelFooter>
    </AppModal>
  );
};
