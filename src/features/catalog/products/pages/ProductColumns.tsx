import { ColumnDef } from "@/components/shared/DataTable/types";
import { ProductPageItem } from "../models/product.model";
import { CheckCircle, Package, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { Switch } from "@/components/shared/Basics/Switch";
import { cn } from "@/lib/utils";
import { getProductAvailability } from "../utils/product-availability";

interface ProductColumnsHandlers {
  /**
   * Si se define, la columna "Disponible" es un switch editable; si no, se
   * muestra "Sí/No" de solo lectura.
   */
  onToggleAvailability?: (
    row: ProductPageItem,
    available: boolean,
  ) => Promise<unknown>;
  /** Ids con un cambio de disponibilidad en curso (switch deshabilitado). */
  pendingAvailabilityIds?: ReadonlySet<string>;
  /**
   * Sucursal de la pantalla (ADMIN: la suya; MANAGER: la del filtro) o null
   * si el MANAGER ve "todas". Define qué disponibilidad muestra el switch.
   */
  scopeLocationId?: string | null;
  /** Nombre de la sucursal del alcance, para el texto de ayuda. */
  scopeLocationName?: string | null;
}

const AVAILABILITY_LABELS = {
  on: { text: "Sí", className: "text-green-600" },
  off: { text: "No", className: "text-red-500" },
  partial: { text: "Parcial", className: "text-amber-600" },
} as const;

export const getProductColumns = ({
  onToggleAvailability,
  pendingAvailabilityIds,
  scopeLocationId = null,
  scopeLocationName = null,
}: ProductColumnsHandlers = {}): ColumnDef<ProductPageItem>[] => [
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
    render: (row) => {
      // Vista de una sucursal (ADMIN o MANAGER filtrado): price ya viene
      // resuelto para esa sucursal.
      if (scopeLocationId) {
        return (
          <span className="text-[13px] font-semibold text-inkblack tabular-nums">
            {formatMoney(row.price)}
          </span>
        );
      }

      // Vista "todas": precio general y aviso si alguna sucursal tiene uno propio.
      const custom = row.locations.filter((loc) => loc.price !== null);
      const detail = custom
        .map((loc) => `${loc.name}: ${formatMoney(loc.price!)}`)
        .join(", ");

      return (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-inkblack tabular-nums">
            {formatMoney(row.basePrice)}
          </span>
          {custom.length > 0 && (
            <span
              className="text-[10px] text-amber-600 whitespace-nowrap"
              title={detail}
            >
              {custom.length === 1 ? detail : "Precio varía por sucursal"}
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "available",
    label: "Disponible",
    sortable: true,
    render: (row) => {
      if (onToggleAvailability) {
        const { state, disabledReason } = getProductAvailability(
          row,
          scopeLocationId,
        );
        const scopeText = scopeLocationId
          ? `en ${scopeLocationName ?? "esta sucursal"}`
          : "en todas sus sucursales";
        const help =
          disabledReason ??
          (state === "partial"
            ? `Disponible solo en algunas sucursales. Actívalo para ofrecerlo ${scopeText}.`
            : `Muestra u oculta el producto en el punto de venta ${scopeText}.`);
        const label = AVAILABILITY_LABELS[state];

        return (
          // Toda la celda es zona del switch: no abrir el modal de la fila.
          // El switch siempre refleja el dato del servidor: si la petición
          // falla, queda en su valor anterior sin lógica extra.
          <div
            className="flex items-center gap-2"
            title={help}
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={state === "on"}
              indeterminate={state === "partial"}
              onChange={(next) => void onToggleAvailability(row, next)}
              disabled={!!disabledReason || pendingAvailabilityIds?.has(row.id)}
              ariaLabel={`Disponible: ${row.name}${state === "partial" ? " (parcial)" : ""}`}
              title={help}
            />
            {disabledReason ? (
              <span className="max-w-[140px] text-[10px] leading-tight text-muted-foreground">
                {disabledReason}
              </span>
            ) : (
              <span className={cn("text-[12px]", label.className)}>
                {label.text}
              </span>
            )}
          </div>
        );
      }

      return (
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
      );
    },
  },
];
