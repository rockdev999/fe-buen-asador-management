import { AlertTriangle, Package, Wheat } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { cn } from "@/lib/utils";
import {
  StockWarning,
  stockWarningUnitLabel,
} from "../../models/stock-warning";

const formatQty = (n: number) =>
  Number.isInteger(n)
    ? String(n)
    : n.toLocaleString("es-BO", { maximumFractionDigits: 3 });

interface StockWarningsModalProps {
  message: string;
  warnings: StockWarning[];
  isLoading: boolean;
  /** Reenvía el mismo pedido con `forceCreate: true`. */
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Avisos del 409 INSUFFICIENT_STOCK al crear un pedido. Las ventas no se
 * bloquean por falta de stock: el cajero decide si lo crea igual.
 */
export const StockWarningsModal = ({
  message,
  warnings,
  isLoading,
  onConfirm,
  onClose,
}: StockWarningsModalProps) => (
  <AppModal size="md" maxHeightClassName="max-h-[80vh]" onClose={onClose}>
    <PanelHeader
      icon={AlertTriangle}
      title="Stock insuficiente"
      description={message}
      onClose={onClose}
    />

    <div className="flex-1 overflow-y-auto px-5 py-4">
      <ul className="flex flex-col gap-2">
        {warnings.map((warning) => {
          const isIngredient = warning.type === "INGREDIENT_STOCK";
          const Icon = isIngredient ? Wheat : Package;
          return (
            <li
              key={`${warning.productId}:${isIngredient ? warning.ingredientId : "product"}`}
              className="flex items-center gap-3 rounded-xl border border-surface bg-white p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-inkblack">
                  {warning.productName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {isIngredient
                    ? `Insumo: ${warning.ingredientName}`
                    : "Stock del producto"}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[12px] font-semibold tabular-nums",
                  warning.currentStock <= 0
                    ? "text-red-500"
                    : "text-yellow-700",
                )}
              >
                Quedan {formatQty(warning.currentStock)}{" "}
                {stockWarningUnitLabel(warning)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Si creas el pedido igual, el stock quedará en negativo hasta que se
        registre un ingreso.
      </p>
    </div>

    <PanelFooter align="right">
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={onClose}
      >
        Volver al pedido
      </Button>
      <Button type="button" isLoading={isLoading} onClick={onConfirm}>
        Crear de todos modos
      </Button>
    </PanelFooter>
  </AppModal>
);
