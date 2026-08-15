import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { cn } from "@/lib/utils";
import { formatLocalDateTimeShort } from "@/lib/formatters";
import { KardexTypeEnum } from "@/constants";
import { StockProduct } from "../../../models/inventory.model";
import { useKardexHandler } from "../../../hooks/useInventory";
import { KARDEX_REASON_LABELS } from "../../../config/inventory.table";

interface KardexModalProps {
  stockItem: StockProduct;
  onClose: () => void;
}

export const KardexModal = ({ stockItem, onClose }: KardexModalProps) => {
  const { data: movements, status } = useKardexHandler(
    stockItem.product.id,
    stockItem.location.id,
  );

  const isLoading = status === "pending";
  const isEmpty = !isLoading && (!movements || movements.length === 0);

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[85vh]" contentClassName="max-w-lg">
      <PanelHeader
        icon={History}
        title="Kardex de movimientos"
        description={`${stockItem.product.name} · ${stockItem.location.name}`}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-2 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-surface" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted-foreground">
              <History size={20} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-inkblack/70">
                Sin movimientos registrados
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Los ajustes y ventas de este producto aparecerán aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {movements!.map((movement) => {
              const isEntry = movement.type === KardexTypeEnum.ENTRY;
              return (
                <div
                  key={movement.id}
                  className="flex items-center gap-3 rounded-xl border border-surface bg-white p-3"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      isEntry ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500",
                    )}
                  >
                    {isEntry ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-medium text-inkblack">
                        {isEntry ? "Entrada" : "Salida"}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60">
                        · {KARDEX_REASON_LABELS[movement.reason]}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {movement.previousQuantity} → {movement.subsequentQuantity}
                      {" · "}
                      {movement.user.name}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className={cn(
                        "text-[13px] font-semibold tabular-nums",
                        isEntry ? "text-green-600" : "text-red-500",
                      )}
                    >
                      {isEntry ? "+" : "-"}
                      {movement.quantity}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatLocalDateTimeShort(movement.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PanelFooter align="right">
        <Button type="button" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </PanelFooter>
    </AppModal>
  );
};
