import { Bell, ChevronRight, Package, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useStockAlertsHandler } from "@/features/inventory/hooks/useInventory";
import { useIngredientStockAlertsHandler } from "@/features/supplies/hooks/useIngredientStock";
import { PATHS } from "@/routes/paths";
import { cn } from "@/lib/utils";

/**
 * Campana con el número de alertas de stock abiertas (productos + insumos).
 *
 * El conteo sale de GET .../alerts (no de sumar eventos SSE) para coincidir
 * siempre con el servidor. Se actualiza solo porque el stream SSE, resolver
 * una alerta y cambiar un mínimo invalidan esas mismas queries.
 *
 * Solo MANAGER y ADMIN: el CASHIER no tiene acceso a las pantallas de stock.
 */
export function StockAlertsBell() {
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const enabled = isManager || isAdmin;

  // ADMIN usa su sucursal para compartir caché con el modal de alertas de su
  // página; MANAGER usa "" (todas las sucursales), igual que su vista por defecto.
  const locationId = isAdmin ? (user?.locationId ?? "") : "";

  const { data: productAlerts } = useStockAlertsHandler(locationId, false, enabled);
  const { data: ingredientAlerts } = useIngredientStockAlertsHandler(
    locationId,
    false,
    enabled,
  );

  if (!enabled) return null;

  // `all=false` ya devuelve solo abiertas; el filtro es defensivo.
  const productCount = (productAlerts ?? []).filter((a) => !a.isResolved).length;
  const ingredientCount = (ingredientAlerts ?? []).filter((a) => !a.isResolved).length;
  const total = productCount + ingredientCount;
  const badge = total > 99 ? "99+" : String(total);

  const rows = [
    {
      key: "products",
      label: "Productos",
      icon: Package,
      count: productCount,
      onSelect: () => navigate(PATHS.INVENTORY),
    },
    {
      key: "ingredients",
      label: "Insumos",
      icon: Wheat,
      count: ingredientCount,
      onSelect: () => navigate(PATHS.INGREDIENTS, { state: { tab: "stock" } }),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            total > 0 ? `${total} alertas de stock abiertas` : "Alertas de stock"
          }
          title="Alertas de stock"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-inkblack"
        >
          <Bell size={16} />
          {total > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white tabular-nums ring-2 ring-white">
              {badge}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 bg-white rounded-lg border shadow-md"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">Alertas de stock</p>
          <p className="text-xs text-muted-foreground">
            {total === 0
              ? "No hay alertas abiertas"
              : `${total} ${total === 1 ? "alerta abierta" : "alertas abiertas"}`}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {rows.map((row) => (
          <DropdownMenuItem
            key={row.key}
            className="cursor-pointer gap-2"
            onClick={row.onSelect}
          >
            <row.icon size={14} />
            <span className="flex-1">{row.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] font-medium tabular-nums",
                row.count > 0
                  ? "bg-red-50 text-red-600"
                  : "bg-surface text-muted-foreground",
              )}
            >
              {row.count}
            </span>
            <ChevronRight size={13} className="text-muted-foreground/60" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
