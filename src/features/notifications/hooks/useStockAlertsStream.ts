import { API_ERROR_CODES, QUERY_KEYS, RoleEnum } from "@/constants";
import { env } from "@/config/env";
import { PATHS } from "@/routes/paths";
import { openEventStream } from "@/services/sse.client";
import { refreshSession } from "@/services/auth/session.service";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertSourceEnum,
  StockAlertEvent,
} from "../models/stock-alert-event.model";

// El stream lo abren todos los roles con sesión (el CASHIER para enterarse de
// cambios del catálogo). Las alertas de stock solo llegan a MANAGER y ADMIN.
const ALERTS_PAGE_ROLES = [RoleEnum.MANAGER, RoleEnum.ADMIN];

/** Queries que muestran el catálogo: el menú del POS y las pantallas de gestión. */
const CATALOG_QUERY_KEYS = [
  QUERY_KEYS.MENU,
  QUERY_KEYS.PRODUCTS,
  QUERY_KEYS.CATEGORIES,
  QUERY_KEYS.MODIFIERS,
];
const TOAST_DURATION_MS = 10_000;

const formatQty = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toLocaleString("es-BO", { maximumFractionDigits: 3 });

/**
 * Escucha /notifications/stream (SSE) mientras haya sesión. Montar una sola
 * vez, en el layout autenticado.
 *
 * - `alert` (MANAGER/ADMIN): muestra un toast e invalida las queries de
 *   alertas y de stock del tipo correspondiente.
 * - `catalog-updated` (todos): invalida el menú del POS y los listados del
 *   catálogo, para que precios, bajas y modificadores se vean al instante.
 */
export function useStockAlertsStream() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // `navigate` puede cambiar al navegar; se guarda en un ref para no reabrir
  // la conexión SSE en cada cambio de página.
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    if (!token || !role) return;

    const canOpenAlertsPage = ALERTS_PAGE_ROLES.includes(role);

    const handleAlert = (alert: StockAlertEvent) => {
      const isProduct = alert.source === AlertSourceEnum.STOCK_PRODUCT;

      queryClient.invalidateQueries({
        queryKey: isProduct
          ? QUERY_KEYS.STOCK_ALERTS
          : QUERY_KEYS.INGREDIENT_STOCK_ALERTS,
      });
      // La cantidad actual cambió (venta, ajuste, etc.): refrescar los listados
      queryClient.invalidateQueries({
        queryKey: isProduct ? ["inventory", "stock"] : ["ingredients", "stock"],
      });
      // La tarjeta de alertas del dashboard se actualiza al instante
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });

      const label = isProduct ? "Stock bajo" : "Insumo bajo";
      toast.warning(`${label}: ${alert.name}`, {
        id: alert.alertId, // evita duplicados si el mismo evento llega dos veces
        description:
          alert.currentQuantity <= 0
            ? "Sin stock disponible"
            : `Quedan ${formatQty(alert.currentQuantity)} (mínimo ${formatQty(alert.minimumStock)})`,
        duration: TOAST_DURATION_MS,
        action: canOpenAlertsPage
          ? {
              label: "Ver",
              onClick: () =>
                isProduct
                  ? navigateRef.current(PATHS.INVENTORY)
                  : // El stock de insumos vive en la pestaña "stock" de Supplies
                    navigateRef.current(PATHS.INGREDIENTS, { state: { tab: "stock" } }),
            }
          : undefined,
      });
    };

    const close = openEventStream({
      url: `${env.API_URL}/notifications/stream`,
      token,
      // El servidor no reenvía lo ocurrido mientras la conexión estuvo caída:
      // al reconectar se refrescan alertas y stock una vez para recuperarlo.
      onOpen: ({ isReconnect }) => {
        if (!isReconnect) return;
        // Los cambios del catálogo mientras no hubo conexión no se reenvían.
        CATALOG_QUERY_KEYS.forEach((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        );
        if (!canOpenAlertsPage) return;
        [
          QUERY_KEYS.STOCK_ALERTS,
          QUERY_KEYS.INGREDIENT_STOCK_ALERTS,
          ["inventory", "stock"],
          ["ingredients", "stock"],
          QUERY_KEYS.DASHBOARD,
        ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      },
      onMessage: ({ event, data }) => {
        // `ping` = heartbeat, solo mantiene viva la conexión.
        if (event === "catalog-updated") {
          // Payload: {"entity":"product"|"category"|"modifier","locationIds":[...]}.
          // No hace falta leerlo: el backend ya filtra por sucursal y solo se
          // vuelven a pedir las queries montadas.
          CATALOG_QUERY_KEYS.forEach((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
          );
          return;
        }
        if (event !== "alert") return;
        try {
          handleAlert(JSON.parse(data) as StockAlertEvent);
        } catch {
          // Evento malformado: se ignora sin cortar el stream
        }
      },
      // 401 TOKEN_EXPIRED (p. ej. al reconectar con un token ya vencido): se
      // renueva la sesión; al cambiar `token` este efecto reabre el stream.
      // Cualquier otro 401/403 deja el stream detenido; el interceptor de
      // axios cierra la sesión en la próxima petición si corresponde.
      onFatalError: (status, errorCode) => {
        if (status === 401 && errorCode === API_ERROR_CODES.TOKEN_EXPIRED) {
          // Si falla, refreshSession ya cerró la sesión o fue un error de red.
          refreshSession(token).catch(() => undefined);
        }
      },
    });

    return close;
  }, [token, role, queryClient]);
}
