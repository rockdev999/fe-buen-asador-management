import {
  API_ERROR_CODES,
  OrderStatusEnum,
  OrderTypeEnum,
  QUERY_KEYS,
  RoleEnum,
} from "@/constants";
import { env } from "@/config/env";
import { PATHS } from "@/routes/paths";
import { refreshSession } from "@/services/auth/session.service";
import { openEventStream } from "@/services/sse.client";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OrderStatusEventDTO, WhatsappOrderDTO } from "../dto/whatsapp-order.dto";
import { mapWhatsappOrderDTOToModel } from "../mappers/whatsapp-order.mapper";
import { useWhatsappOrdersStore } from "../stores/whatsapp-orders.store";
import { shortOrderId } from "@/lib/order-code";
import {
  playNotificationSound,
  unlockNotificationSound,
} from "../utils/notification-sound";
import { fetchWhatsappOrders } from "./useWhatsappOrders";

export const WHATSAPP_ROLES = [RoleEnum.CASHIER, RoleEnum.ADMIN, RoleEnum.MANAGER];
const TOAST_DURATION_MS = 15_000;

/**
 * Mantiene la bandeja de pedidos de WhatsApp sincronizada mientras haya sesión.
 * Montar una sola vez, en el layout autenticado.
 *
 *  1. Carga el estado inicial con GET /whatsapp/orders.
 *  2. Abre GET /whatsapp/orders/stream (SSE):
 *     - `whatsapp-order`: agrega el pedido, suena y muestra un toast.
 *     - `order-status`: actualiza el estado, o lo quita si quedó PAID
 *       (cobro, también desde otra pestaña) o CANCELLED.
 *     - `ping`: heartbeat, solo mantiene viva la conexión.
 *  3. En cada reconexión vuelve a pedir el GET: el servidor no reenvía lo
 *     emitido mientras el stream estuvo caído.
 */
export function useWhatsappOrdersStream() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // El navegador bloquea el audio hasta la primera interacción del usuario.
  useEffect(() => unlockNotificationSound(), []);

  useEffect(() => {
    const store = useWhatsappOrdersStore.getState();

    if (!token || !role || !WHATSAPP_ROLES.includes(role)) {
      store.reset(); // cierre de sesión: no dejar pedidos de otra sesión
      return;
    }

    // Solo se aplica la respuesta del GET más reciente
    let requestSeq = 0;
    let closed = false;

    const reload = async () => {
      const seq = ++requestSeq;
      const { loadStatus, setLoadStatus } = useWhatsappOrdersStore.getState();
      if (loadStatus !== "ready") setLoadStatus("loading");
      try {
        const list = await fetchWhatsappOrders();
        if (!closed && seq === requestSeq) {
          useWhatsappOrdersStore.getState().replaceAll(list);
        }
      } catch {
        if (!closed && seq === requestSeq) {
          const s = useWhatsappOrdersStore.getState();
          if (s.loadStatus !== "ready") s.setLoadStatus("error");
        }
      }
    };

    const handleNewOrder = (dto: WhatsappOrderDTO) => {
      const order = mapWhatsappOrderDTOToModel(dto);
      const isNew = useWhatsappOrdersStore.getState().upsert(order);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      if (!isNew || order.status !== OrderStatusEnum.PENDING) return;

      playNotificationSound();
      toast.info(`Nuevo pedido de WhatsApp #${order.shortId}`, {
        id: `wa-${order.id}`, // evita duplicados si el evento llega dos veces
        description: [
          order.customerName,
          order.type === OrderTypeEnum.DELIVERY ? "Delivery" : "Recojo",
        ]
          .filter(Boolean)
          .join(" · "),
        duration: TOAST_DURATION_MS,
        action: {
          label: "Ver",
          onClick: () => navigateRef.current(PATHS.WHATSAPP_ORDERS),
        },
      });
    };

    const handleStatus = (event: OrderStatusEventDTO) => {
      // Cancelado por el sistema: nadie lo aprobó dentro del plazo
      if (event.status === OrderStatusEnum.CANCELLED && event.automatic) {
        toast.warning(
          `Pedido #${shortOrderId(event.orderId)} cancelado: no se confirmó a tiempo`,
          { id: `wa-expired-${event.orderId}`, duration: TOAST_DURATION_MS },
        );
      }

      const known = useWhatsappOrdersStore
        .getState()
        .applyStatus(event.orderId, event.status);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      // Un pedido activo que no conocemos (p. ej. se perdió su evento de
      // creación): se recarga la bandeja para traerlo con sus datos.
      if (
        !known &&
        event.status !== OrderStatusEnum.CANCELLED &&
        event.status !== OrderStatusEnum.PAID
      ) {
        void reload();
      }
    };

    void reload();

    const close = openEventStream({
      url: `${env.API_URL}/whatsapp/orders/stream`,
      token,
      onOpen: ({ isReconnect }) => {
        if (isReconnect) void reload();
      },
      onMessage: ({ event, data }) => {
        try {
          if (event === "whatsapp-order") {
            handleNewOrder(JSON.parse(data) as WhatsappOrderDTO);
          } else if (event === "order-status") {
            handleStatus(JSON.parse(data) as OrderStatusEventDTO);
          }
          // `ping` se ignora
        } catch {
          // Evento malformado: se ignora sin cortar el stream
        }
      },
      // 401 TOKEN_EXPIRED: se renueva la sesión y, al cambiar `token`, este
      // efecto reabre el stream. 403 (rol sin permiso) deja el stream detenido.
      onFatalError: (status, errorCode) => {
        if (status === 401 && errorCode === API_ERROR_CODES.TOKEN_EXPIRED) {
          refreshSession(token).catch(() => undefined);
        }
      },
    });

    return () => {
      closed = true;
      close();
    };
  }, [token, role, queryClient]);
}
