import { FolderTree, ListOrdered } from "lucide-react";
import { formatLocalDate } from "@/lib/formatters";
import { Modifier } from "../../models/modifier.model";
import { cn, formatMoney } from "@/lib/utils";

interface ModifierCardProps {
  modifier: Modifier;
  /** Si se define, la tarjeta es clickeable y abre la edición (solo MANAGER). */
  onEdit?: (modifier: Modifier) => void;
  /**
   * ADMIN: muestra el precio de su sucursal (extraPrice ya viene resuelto).
   * MANAGER: muestra el general y el detalle de las sucursales con precio propio.
   */
  showLocationPrice?: boolean;
}

export function ModifierCard({
  modifier,
  onEdit,
  showLocationPrice = false,
}: ModifierCardProps) {
  const custom = showLocationPrice
    ? []
    : modifier.locations.filter((loc) => loc.extraPrice !== null);
  const detail = custom
    .map((loc) => `${loc.name}: ${formatMoney(loc.extraPrice!)}`)
    .join(", ");
  return (
    <div
      className={cn(
        "group rounded-2xl border border-surface bg-white p-4 shadow-sm transition-all",
        onEdit && "cursor-pointer hover:border-brand/30 hover:shadow-md",
      )}
      onClick={onEdit ? () => onEdit(modifier) : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <FolderTree size={16} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-semibold text-inkblack">
              {modifier.name}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ListOrdered size={12} />
              <span>
                Precio:{" "}
                {formatMoney(
                  showLocationPrice
                    ? modifier.extraPrice
                    : modifier.baseExtraPrice,
                )}
              </span>
            </div>
            {custom.length > 0 && (
              <p
                className="mt-0.5 truncate text-[10px] text-amber-600"
                title={detail}
              >
                {detail}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center mt-2 rounded-xl bg-surface/40 px-3 py-2">
        <p className="pe-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
          Última actualización:{" "}
        </p>

        <p className="text-[11px] font-medium text-inkblack">
          {modifier.audit && modifier.audit?.updatedAt
            ? formatLocalDate(modifier.audit.updatedAt)
            : "--"}
        </p>
      </div>
    </div>
  );
}
