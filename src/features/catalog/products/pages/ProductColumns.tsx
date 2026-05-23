import { ColumnDef } from "@/components/shared/DataTable/types";
import { ProductPageItem } from "../models/product.model";
import { CheckCircle, Package, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/utils";

export const PRODUCT_COLUMNS: ColumnDef<ProductPageItem>[] = [
  {
    key: "name",
    label: "Producto",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2.5">
        {row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.name}
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
            <Package size={13} className="text-muted-foreground/40" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-inkblack truncate">
            {row.name}
          </p>
          {row.brand && (
            <p className="text-[10px] text-muted-foreground truncate">
              {row.brand}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "description",
    label: "Descripción",
    render: (row) => (
      <span className="text-[12px] text-muted-foreground line-clamp-1 max-w-[200px]">
        {row.description ?? <span className="opacity-40">—</span>}
      </span>
    ),
  },
  {
    key: "category",
    label: "Categoría",
    sortable: true,
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted-foreground border border-surface/80">
        {row.category.name}
      </span>
    ),
  },
  {
    key: "locationName",
    label: "Sucursal",
    sortable: true,
    render: (row) => (
      <span className="text-[12px] text-muted-foreground">
        {row.location.name}
      </span>
    ),
  },
  {
    key: "price",
    label: "Precio",
    sortable: true,
    render: (row) => (
      <span className="text-[13px] font-semibold text-inkblack tabular-nums">
        {formatMoney(row.price)}
      </span>
    ),
  },
  {
    key: "available",
    label: "Disponible",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-1.5">
        {row.available ? (
          <>
            <CheckCircle size={13} className="text-green-500" />
            <span className="text-[12px] text-green-600">Sí</span>
          </>
        ) : (
          <>
            <XCircle size={13} className="text-red-400" />
            <span className="text-[12px] text-red-500">No</span>
          </>
        )}
      </div>
    ),
  },
];
