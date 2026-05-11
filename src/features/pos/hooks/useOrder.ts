import {
  usePaginatedGetHandler,
  usePostHandler,
  usePutHandler,
} from "@/hooks/api.handlers";
import { CreateOrderDTO, OrderDTO, OrderPageItemDTO } from "../dto/order.dto";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { DATA_TABLE, OrderStatusEnum, QUERY_KEYS } from "@/constants";
import { useMemo } from "react";
import {
  mapOrderDTOToModel,
  mapOrderPageItemDTOToModel,
} from "../mappers/order.mapper";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";
import { useAuthStore } from "@/stores/auth.store";

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
    limit: DATA_TABLE.ORDERS.limit,
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
    queryKey: QUERY_KEYS.ORDERS,
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

export const useCreateOrder = () => {
  const handler = usePostHandler({
    mutationFn: (dto: CreateOrderDTO) =>
      httpClient
        .post<ApiResponse<OrderDTO>>("/orders", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.ORDERS],
  });

  const data = useMemo(
    () => (handler.data ? mapOrderDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useUpdateOrderStatus = () => {
  const handler = usePutHandler({
    mutationFn: ({ id, status }: { id: string; status: OrderStatusEnum }) =>
      httpClient
        .put<ApiResponse<OrderDTO>>(`/orders/${id}/status`, { status })
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.ORDERS],
  });

  const data = useMemo(
    () => (handler.data ? mapOrderDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};
