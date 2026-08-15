import { QUERY_KEYS } from "@/constants";
import { useGetHandler, usePostHandler, usePutHandler } from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { useMemo } from "react";
import {
  mapKardexDTOToModel,
  mapStockAlertDTOToModel,
  mapStockProductDTOToModel,
} from "../mappers/inventory.mapper";
import {
  AdjustStockDTO,
  KardexDTO,
  StockAlertDTO,
  StockProductDTO,
} from "../dto/inventory.dto";

export const useStockHandler = (locationId: string, enabled: boolean = true) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.STOCK(locationId),
    queryFn: () =>
      httpClient
        .get<ApiResponse<StockProductDTO[]>>("/inventory/stock", {
          params: locationId ? { locationId } : {},
        })
        .then((r) => r.data.data!),
    enabled,
    staleTime: 0, // always fetch fresh data for stock levels
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapStockProductDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useAdjustStock = (locationId: string) => {
  const handler = usePostHandler({
    mutationFn: (dto: AdjustStockDTO) =>
      httpClient
        .post<ApiResponse<StockProductDTO>>("/inventory/stock/adjust", dto, {
          params: locationId ? { locationId } : {},
        })
        .then((r) => r.data.data!),
    // El listado de stock (QUERY_KEYS.STOCK) se refresca manualmente con
    // refetch() desde quien llama — invalidarlo aquí duplicaría la petición.
    invalidateKeys: [QUERY_KEYS.STOCK_ALERTS],
    successMessage: "Stock ajustado exitosamente",
  });

  return { ...handler };
};

export const useKardexHandler = (
  productId: string | null,
  locationId: string,
  options?: { enabled?: boolean },
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.KARDEX(productId ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<KardexDTO[]>>(`/inventory/kardex/${productId}`, {
          params: locationId ? { locationId } : {},
        })
        .then((r) => r.data.data!),
    enabled: !!productId && (options?.enabled ?? true),
    staleTime: 0, // no caching, always fetch fresh movements
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapKardexDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useStockAlertsHandler = (
  locationId: string,
  all: boolean,
  enabled: boolean = true,
) => {
  const handler = useGetHandler({
    queryKey: [...QUERY_KEYS.STOCK_ALERTS, locationId, all],
    queryFn: () =>
      httpClient
        .get<ApiResponse<StockAlertDTO[]>>("/inventory/alerts", {
          params: { ...(locationId && { locationId }), all },
        })
        .then((r) => r.data.data!),
    enabled,
    staleTime: 0, // no caching, always fetch fresh alerts
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapStockAlertDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useResolveStockAlert = () => {
  const handler = usePutHandler({
    mutationFn: (alertId: string) =>
      httpClient
        .put<ApiResponse<StockAlertDTO>>(`/inventory/alerts/${alertId}/resolve`, {})
        .then((r) => r.data.data!),
    invalidateKeys: [QUERY_KEYS.STOCK_ALERTS],
    successMessage: "Alerta resuelta exitosamente",
  });

  return { ...handler };
};
