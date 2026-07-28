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
    label: "Sucursales",
    sortable: true,
    render: (row) => {
      if (!row.locations?.length) {
        return <span className="text-[11px] text-muted-foreground/40">--</span>;
      }

      const MAX_VISIBLE = 1;
      const visible = row.locations.slice(0, MAX_VISIBLE);
      const remaining = row.locations.length - MAX_VISIBLE;

      return (
        <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
          {visible.map((loc) => (
            <span
              key={loc.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-inkblack border border-surface/80 whitespace-nowrap"
              title={loc.name}
            >
              {loc.name}
            </span>
          ))}
          {remaining > 0 && (
            <span
              className="text-[10px] text-muted-foreground/60 whitespace-nowrap"
              title={row.locations
                .slice(MAX_VISIBLE)
                .map((l) => l.name)
                .join(", ")}
            >
              +{remaining} más
            </span>
          )}
        </div>
      );
    },
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
