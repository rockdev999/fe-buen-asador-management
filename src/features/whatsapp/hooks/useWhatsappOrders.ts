import { QUERY_KEYS } from "@/constants";
import { OrderDTO } from "@/features/pos/dto/order.dto";
import { httpClient } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { WhatsappOrderDTO } from "../dto/whatsapp-order.dto";
import { mapWhatsappOrderDTOToModel } from "../mappers/whatsapp-order.mapper";
import { WhatsappOrder } from "../models/whatsapp-order.model";
import { useWhatsappOrdersStore } from "../stores/whatsapp-orders.store";

/**
 * GET /whatsapp/orders — pedidos de WhatsApp activos (ni PAID ni CANCELLED),
 * del más antiguo al más nuevo. El backend filtra por sucursal según el rol;
 * MANAGER recibe todas si no envía `locationId`.
 */
export function fetchWhatsappOrders(locationId?: string): Promise<WhatsappOrder[]> {
  return httpClient
    .get<ApiResponse<WhatsappOrderDTO[]>>("/whatsapp/orders", {
      params: locationId ? { locationId } : undefined,
    })
    .then((r) => (r.data.data ?? []).map(mapWhatsappOrderDTOToModel));
}

/**
 * Recarga un pedido con GET /orders/:id y lo sincroniza en la bandeja.
 * Se usa tras un 409 (otro cajero ya lo movió): lo quita si quedó PAID o
 * CANCELLED, o actualiza su estado si sigue activo.
 */
export function useRefreshWhatsappOrder() {
  const queryClient = useQueryClient();
  const applyOrderDTO = useWhatsappOrdersStore((s) => s.applyOrderDTO);

  return useCallback(
    async (orderId: string) => {
      try {
        const order = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.ORDER(orderId),
          queryFn: () =>
            httpClient
              .get<ApiResponse<OrderDTO>>(`/orders/${orderId}`)
              .then((r) => r.data.data!),
          staleTime: 0,
        });
        applyOrderDTO(order);
      } catch {
        // El interceptor ya mostró el error
      }
    },
    [queryClient, applyOrderDTO],
  );
}
