import { QUERY_KEYS } from "@/constants";
import {
  useGetHandler,
  usePatchHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { httpClient } from "@/services/http.client";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  mapIngredientKardexDTOToModel,
  mapIngredientStockAlertDTOToModel,
  mapIngredientStockDTOToModel,
} from "../mappers/ingredient.mapper";
import {
  AdjustIngredientStockDTO,
  IngredientKardexDTO,
  IngredientStockAlertDTO,
  IngredientStockDTO,
} from "../dto/ingredient.dto";

export const useIngredientStockHandler = (
  locationId: string,
  enabled: boolean = true,
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.INGREDIENT_STOCK(locationId),
    queryFn: () =>
      httpClient
        .get<ApiResponse<IngredientStockDTO[]>>("/ingredients/stock/all", {
          params: locationId ? { locationId } : {},
        })
        .then((r) => r.data.data!),
    enabled,
    staleTime: 0, // always fetch fresh data for stock levels
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapIngredientStockDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useAdjustIngredientStock = (
  locationId: string,
  options?: { onErrorCallback?: (error: ApiErrorResponse) => void },
) => {
  const handler = usePostHandler({
    mutationFn: (dto: AdjustIngredientStockDTO) =>
      httpClient
        .post<ApiResponse<IngredientStockDTO>>("/ingredients/stock/adjust", dto, {
          params: locationId ? { locationId } : {},
        })
        .then((r) => r.data.data!),
    // El listado de stock (INGREDIENT_STOCK) se refresca manualmente con
    // refetch() desde quien llama — invalidarlo aquí duplicaría la petición.
    invalidateKeys: [QUERY_KEYS.INGREDIENT_STOCK_ALERTS],
    successMessage: "Stock de insumo ajustado exitosamente",
    onErrorCallback: options?.onErrorCallback,
  });

  return { ...handler };
};

export const useUpdateIngredientMinimumStock = () => {
  const queryClient = useQueryClient();

  const handler = usePatchHandler({
    mutationFn: ({ id, minimumStock }: { id: string; minimumStock: number }) =>
      httpClient
        .patch<ApiResponse<IngredientStockDTO>>(
          `/ingredients/stock/${id}/minimum`,
          { minimumStock },
        )
        .then((r) => r.data.data!),
    // Si el nuevo mínimo dispara una alerta, el listado de alertas debe reflejarla.
    invalidateKeys: [QUERY_KEYS.INGREDIENT_STOCK_ALERTS],
    successMessage: "Stock mínimo actualizado exitosamente",
    // La respuesta es la fila actualizada: se reemplaza en todos los listados
    // de stock en caché (cualquier locationId) sin volver a pedirlos.
    onSuccessCallback: (updated) => {
      queryClient.setQueriesData<IngredientStockDTO[]>(
        { queryKey: ["ingredients", "stock"] },
        (old) => old?.map((row) => (row.id === updated.id ? updated : row)),
      );
    },
  });

  return { ...handler };
};

export const useIngredientKardexHandler = (
  ingredientId: string | null,
  locationId: string,
  options?: { enabled?: boolean },
) => {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.INGREDIENT_KARDEX(ingredientId ?? ""),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<IngredientKardexDTO[]>
        >(`/ingredients/kardex/${ingredientId}`, {
          params: locationId ? { locationId } : {},
        })
        .then((r) => r.data.data!),
    enabled: !!ingredientId && (options?.enabled ?? true),
    staleTime: 0, // no caching, always fetch fresh movements
    // 404 = el producto/insumo no existe; reintentar solo duplicaría el error.
    // Ojo: el error.interceptor rechaza con { message, fields, status, errorCode },
    // no con ApiErrorResponse, así que el código HTTP viene en `status`.
    retry: (failureCount, error) =>
      (error as unknown as { status?: number } | null)?.status !== 404 &&
      failureCount < 1,
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapIngredientKardexDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useIngredientStockAlertsHandler = (
  locationId: string,
  all: boolean,
  enabled: boolean = true,
) => {
  const handler = useGetHandler({
    queryKey: [...QUERY_KEYS.INGREDIENT_STOCK_ALERTS, locationId, all],
    queryFn: () =>
      httpClient
        .get<ApiResponse<IngredientStockAlertDTO[]>>("/ingredients/alerts/all", {
          params: { ...(locationId && { locationId }), all },
        })
        .then((r) => r.data.data!),
    enabled,
    staleTime: 0, // no caching, always fetch fresh alerts
  });

  const data = useMemo(
    () => (handler.data ? handler.data.map(mapIngredientStockAlertDTOToModel) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useResolveIngredientStockAlert = () => {
  const handler = usePutHandler({
    mutationFn: (alertId: string) =>
      httpClient
        .put<
          ApiResponse<IngredientStockAlertDTO>
        >(`/ingredients/alerts/${alertId}/resolve`, {})
        .then((r) => r.data.data!),
    invalidateKeys: [QUERY_KEYS.INGREDIENT_STOCK_ALERTS],
    successMessage: "Alerta resuelta exitosamente",
  });

  return { ...handler };
};
