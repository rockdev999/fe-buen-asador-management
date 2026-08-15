import { ColumnDef } from "@/components/shared/DataTable/types";
import { StockProduct } from "../../models/inventory.model";
import { AlertTriangle, History, PackagePlus } from "lucide-react";
import { formatLocalDateTimeShort } from "@/lib/formatters";
import { Button } from "@/components/shared/Basics/Button";
import { STOCK_UNIT_LABELS } from "../../config/inventory.table";
import { cn } from "@/lib/utils";

interface InventoryColumnsHandlers {
  onAdjust: (item: StockProduct) => void;
  onKardex: (item: StockProduct) => void;
}

export const getInventoryColumns = ({
  onAdjust,
  onKardex,
}: InventoryColumnsHandlers): ColumnDef<StockProduct>[] => [
  {
    key: "product",
    label: "Producto",
    sortable: true,
    render: (row) => (
      <p className="text-[13px] font-medium text-inkblack truncate">
        {row.product.name}
      </p>
    ),
  },
  {
    key: "location",
    label: "Sucursal",
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted-foreground border border-surface/80">
        {row.location.name}
      </span>
    ),
  },
  {
    key: "currentQuantity",
    label: "Cantidad actual",
    sortable: true,
    render: (row) => {
      const isLow = row.currentQuantity < row.minimumStock;
      return (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[13px] font-semibold tabular-nums",
              isLow ? "text-red-500" : "text-inkblack",
            )}
          >
            {row.currentQuantity}
          </span>
          {isLow && (
            <AlertTriangle
              size={12}
              className="text-red-500"
              aria-label="Stock bajo mínimo"
            />
          )}
        </div>
      );
    },
  },
  {
    key: "minimumStock",
    label: "Stock mínimo",
    sortable: true,
    render: (row) => (
      <span className="text-[12px] text-muted-foreground tabular-nums">
        {row.minimumStock}
      </span>
    ),
  },
  {
    key: "unitOfMeasure",
    label: "Unidad",
    render: (row) => (
      <span className="text-[12px] text-muted-foreground">
        {STOCK_UNIT_LABELS[row.unitOfMeasure]}
      </span>
    ),
  },
  {
    key: "updatedAt",
    label: "Actualizado",
    sortable: true,
    render: (row) => (
      <span className="text-[12px] text-muted-foreground">
        {formatLocalDateTimeShort(row.updatedAt)}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Acciones",
    render: (row) => (
      <div className="flex items-center gap-1.5">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => onAdjust(row)}
          title="Ajustar stock"
        >
          <PackagePlus size={13} />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => onKardex(row)}
          title="Ver kardex"
        >
          <History size={13} />
        </Button>
      </div>
    ),
  },
];
