import { Building2, FolderTree, ListOrdered } from "lucide-react";
import { Category } from "../../models/category.model";
import { formatLocalDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/shared/Basics/Switch";
import { getCategoryAvailability } from "@/features/catalog/products/utils/product-availability";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  /** Si se define, muestra el switch de disponibilidad. */
  onToggleAvailability?: (category: Category, available: boolean) => void;
  isTogglePending?: boolean;
  /** "en Casa Matriz" / "en todas las sucursales", para el texto de ayuda. */
  scopeText?: string;
}

export function CategoryCard({
  category,
  onEdit,
  onToggleAvailability,
  isTogglePending = false,
  scopeText = "",
}: CategoryCardProps) {
  const state = getCategoryAvailability(category);
  return (
    <div
      className="group rounded-2xl border border-surface bg-white p-4 shadow-sm transition-all hover:border-brand/30 hover:shadow-md"
      onClick={() => onEdit(category)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <FolderTree size={16} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-semibold text-inkblack">
              {category.name}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ListOrdered size={12} />
              <span>Orden {category.sortOrder}</span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Building2 size={12} className="shrink-0" />
              {category.locations.length === 0 ? (
                <span className="italic">Sin sucursales</span>
              ) : (
                <span className="truncate">
                  {category.locations
                    .slice(0, 2)
                    .map((location) => location.name)
                    .join(", ")}
                  {category.locations.length > 2 && (
                    <span className="font-medium text-brand">
                      {" "}
                      +{category.locations.length - 2}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {onToggleAvailability && (
          // Zona del switch: no abrir el modal de edición de la tarjeta.
          <div
            className="flex shrink-0 flex-col items-end gap-1"
            onClick={(e) => e.stopPropagation()}
            title={
              state === "empty"
                ? "La categoría no tiene productos " + scopeText
                : "Activa o desactiva todos sus productos " + scopeText
            }
          >
            <Switch
              checked={state === "on"}
              indeterminate={state === "partial"}
              disabled={state === "empty" || isTogglePending}
              onChange={(next) => onToggleAvailability(category, next)}
              ariaLabel={
                "Disponible: " +
                category.name +
                (state === "partial" ? " (parcial)" : "")
              }
            />
            <span
              className={cn(
                "text-[10px] tabular-nums whitespace-nowrap",
                state === "on" && "text-green-600",
                state === "off" && "text-red-500",
                state === "partial" && "text-amber-600",
                state === "empty" && "text-muted-foreground",
              )}
            >
              {state === "empty"
                ? "Sin productos"
                : `${category.availableProductsCount}/${category.productsCount} disponibles`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center mt-2 rounded-xl bg-surface/40 px-3 py-2">
        <p className="pe-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
          Última actualización:{" "}
        </p>

        <p className="text-[11px] font-medium text-inkblack">
          {category.audit && category.audit?.updatedAt
            ? formatLocalDate(category.audit.updatedAt)
            : "--"}
        </p>
      </div>
    </div>
  );
}
