import { usePostHandler, usePutHandler } from "@/hooks/api.handlers";
import { useCartStore } from "../stores/cart.store";
import {
  CreateOrderDeliveryDTO,
  CreateOrderInPersonDTO,
  OrderDTO,
} from "../dto/order.dto";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { OrderStatusEnum, QUERY_KEYS } from "@/constants";
import { useMemo } from "react";
import { mapOrderDTOToModel } from "../mappers/order.mapper";

export const useCreateOrderInPerson = () => {
  const { clearCart } = useCartStore();

  const handler = usePostHandler({
    mutationFn: (dto: CreateOrderInPersonDTO) =>
      httpClient
        .post<ApiResponse<OrderDTO>>("/orders", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.ORDERS],
    onSuccessCallback: () => clearCart(),
  });

  const data = useMemo(
    () => (handler.data ? mapOrderDTOToModel(handler.data) : null),
    [handler.data],
  );

  return { ...handler, data };
};

export const useCreateOrderDelivery = () => {
  const { clearCart } = useCartStore();

  const handler = usePostHandler({
    mutationFn: (dto: CreateOrderDeliveryDTO) =>
      httpClient
        .post<ApiResponse<OrderDTO>>("/orders", dto)
        .then((r) => r.data.data!),

    invalidateKeys: [QUERY_KEYS.ORDERS],
    onSuccessCallback: () => clearCart(),
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
