import { QUERY_KEYS, RoleEnum } from "@/constants";
import { useGetHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { DashboardDTO } from "../dto/dashboard.dto";

const REFRESH_INTERVAL_MS = 60_000;

/**
 * Resumen del día. `locationId` solo aplica al MANAGER (null = todas);
 * para ADMIN el backend siempre usa su sucursal.
 * Se refresca cada minuto, al volver a la pestaña y cuando llega una alerta
 * de stock por SSE (useStockAlertsStream invalida ["dashboard"]).
 */
export function useDashboard(locationId: string | null) {
  return useGetHandler<DashboardDTO>({
    queryKey: QUERY_KEYS.DASHBOARD_BY_LOCATION(locationId),
    queryFn: () =>
      httpClient
        .get<ApiResponse<DashboardDTO>>("/finances/reports/dashboard", {
          params: locationId ? { locationId } : undefined,
        })
        .then((r) => r.data.data!),
    staleTime: 0,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    retry: false,
    roles: [RoleEnum.MANAGER, RoleEnum.ADMIN],
  });
}
