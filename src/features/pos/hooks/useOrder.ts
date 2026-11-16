import { useQueryClient } from "@tanstack/react-query";
import {
  useGetHandler,
  usePaginatedGetHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import {
  CreateOrderDTO,
  ManagerOrderPageItemDTO,
  OrderDTO,
  OrderPageItemDTO,
} from "../dto/order.dto";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { DATA_TABLE, OrderStatusEnum, QUERY_KEYS } from "@/constants";
import { useMemo } from "react";
import {
  mapOrderDTOToModel,
  mapOrderDTOToSnapshot,
  mapManagerOrderPageItemDTOToModel,
  mapOrderPageItemDTOToModel,
} from "../mappers/order.mapper";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";
import { useAuthStore } from "@/stores/auth.store";
import { useWhatsappOrdersStore } from "@/features/whatsapp/stores/whatsapp-orders.store";

interface UseOrdersPageParams {
  page: number;
  search?: string;
  status?: string;
  type?: string;
  channel?: string;
  sortKey?: string;
  sortDir?: SortDirectionEnum | null;
}

export function useOrdersPage({
  page,
  search,
  status,
  type,
  channel,
  sortKey,
  sortDir,
}: UseOrdersPageParams) {
  const locationId = useAuthStore((s) => s.user?.locationId);

  const params = {
    page,
    limit: DATA_TABLE.ORDERS.limit ?? 10,
    ...(search && { search }),
    ...(status && { status }),
    ...(type && { type }),
    ...(channel && { channel }),
    ...(sortKey && { sortBy: sortKey }),
    ...(sortDir && { sortOrder: sortDir }),
  };

  return usePaginatedGetHandler<
    OrderPageItemDTO,
    ReturnType<typeof mapOrderPageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_ORDERS(locationId, params),
    queryFn: () =>
      httpClient
        .get<
          ApiResponse<OrderPageItemDTO[]>
        >(`/orders/${locationId}/page-by-location`, { params })
        .then((r) => r.data),
    select: mapOrderPageItemDTOToModel,
    params,
    enabled: !!locationId,
    staleTime: 30 * 1000,
  });
}

interface UseManagerOrdersPageParams {
  page: number;
  search?: string;
  status?: string;
  type?: string;
  channel?: string;
  locationId?: string;
  updatedDate?: string;
  includeAll?: boolean;
  sortKey?: string;
  sortDir?: SortDirectionEnum | null;
}

// Vista global (todas las sucursales) exclusiva de MANAGER — /orders/page,
// a diferencia de /orders/:locationId/page-by-location que depende del
// locationId del token (null para MANAGER).
export function useManagerOrdersPage({
  page,
  search,
  status,
  type,
  channel,
  locationId,
  updatedDate,
  includeAll,
  sortKey,
  sortDir,
}: UseManagerOrdersPageParams) {
  const params = {
    page,
    limit: DATA_TABLE.ORDERS.limit ?? 10,
    ...(search && { search }),
    ...(status && { status }),
    ...(type && { type }),
    ...(channel && { channel }),
    ...(locationId && { locationId }),
    ...(updatedDate && { updatedDate }),
    ...(includeAll && { includeAll }),
    ...(sortKey && { sortBy: sortKey }),
    ...(sortDir && { sortOrder: sortDir }),
  };

  return usePaginatedGetHandler<
    ManagerOrderPageItemDTO,
    ReturnType<typeof mapManagerOrderPageItemDTOToModel>
  >({
    queryKey: QUERY_KEYS.PAGINATION_ORDERS_MANAGER(params),
    queryFn: () =>
      httpClient
        .get<ApiResponse<ManagerOrderPageItemDTO[]>>("/orders/page", {
          params,
        })
        .then((r) => r.data),
    select: mapManagerOrderPageItemDTOToModel,
    params,
    enabled: true,
    staleTime: 0,
  });
}

export function useGetOrderById(id: string | null) {
  const handler = useGetHandler({
    queryKey: QUERY_KEYS.ORDER(id ?? ""),
    queryFn: () =>
      httpClient
        .get<ApiResponse<OrderDTO>>(`/orders/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = useMemo(
    () => (handler.data ? mapOrderDTOToSnapshot(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const handler = usePostHandler({
    mutationFn: (dto: CreateOrderDTO) =>
      httpClient
        .post<ApiResponse<OrderDTO>>("/orders", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.ORDERS],
    // 400 "El producto X no está disponible en esta sucursal": alguien lo
    // apagó mientras se armaba el pedido. El interceptor ya mostró el mensaje;
    // se refresca el menú para que desaparezca. (El backend no envía un
    // errorCode específico, por eso se reconoce por el texto.)
    onErrorCallback: (error) => {
      if (/no está disponible en esta sucursal/i.test(error?.message ?? "")) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MENU });
      }
    },
  });

  const data = useMemo(
    () => (handler.data ? mapOrderDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useUpdateOrderStatus = () => {
  const handler = usePutHandler({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: OrderStatusEnum;
      reason?: string;
    }) =>
      httpClient
        .put<ApiResponse<OrderDTO>>(`/orders/${id}/status`, {
          status,
          ...(reason && { reason }),
        })
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.ORDERS],
    // Si es un pedido de WhatsApp, la bandeja se actualiza sin esperar al SSE.
    onSuccessCallback: (order) =>
      useWhatsappOrdersStore.getState().applyOrderDTO(order),
  });

  const data = useMemo(
    () => (handler.data ? mapOrderDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};
