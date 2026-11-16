import { OrderStatusEnum } from "@/constants";
import { OrderDTO } from "@/features/pos/dto/order.dto";
import { create } from "zustand";
import { WhatsappOrder } from "../models/whatsapp-order.model";
import { mergeOrderDTO } from "../mappers/whatsapp-order.mapper";

/** Estados que salen de la bandeja (GET /whatsapp/orders tampoco los devuelve). */
const FINAL_STATUSES: OrderStatusEnum[] = [
  OrderStatusEnum.PAID,
  OrderStatusEnum.CANCELLED,
];

export const isFinalStatus = (status: OrderStatusEnum) =>
  FINAL_STATUSES.includes(status);

type LoadStatus = "idle" | "loading" | "ready" | "error";

interface WhatsappOrdersState {
  /** Bandeja indexada por order.id: deduplica lo que llega por GET y por SSE. */
  orders: Record<string, WhatsappOrder>;
  loadStatus: LoadStatus;

  setLoadStatus: (status: LoadStatus) => void;
  /** Reemplaza la bandeja con la respuesta de GET /whatsapp/orders. */
  replaceAll: (orders: WhatsappOrder[]) => void;
  /** Agrega o reemplaza un pedido. Devuelve true si no estaba en la bandeja. */
  upsert: (order: WhatsappOrder) => boolean;
  /**
   * Aplica un cambio de estado. Devuelve false si el pedido no estaba en la
   * bandeja (quien llama decide si recargar).
   */
  applyStatus: (orderId: string, status: OrderStatusEnum) => boolean;
  /** Refresca un pedido conocido con un OrderDTO (PUT /status, GET /orders/:id). */
  applyOrderDTO: (order: OrderDTO) => void;
  remove: (orderId: string) => void;
  reset: () => void;
}

export const useWhatsappOrdersStore = create<WhatsappOrdersState>()((set, get) => ({
  orders: {},
  loadStatus: "idle",

  setLoadStatus: (loadStatus) => set({ loadStatus }),

  replaceAll: (list) =>
    set({
      orders: Object.fromEntries(
        list.filter((o) => !isFinalStatus(o.status)).map((o) => [o.id, o]),
      ),
      loadStatus: "ready",
    }),

  upsert: (order) => {
    const isNew = !get().orders[order.id];
    if (isFinalStatus(order.status)) {
      get().remove(order.id);
      return false;
    }
    set((s) => ({ orders: { ...s.orders, [order.id]: order } }));
    return isNew;
  },

  applyStatus: (orderId, status) => {
    const current = get().orders[orderId];
    if (!current) return false;
    if (isFinalStatus(status)) get().remove(orderId);
    else if (current.status !== status)
      set((s) => ({
        orders: {
          ...s.orders,
          // El plazo de vencimiento solo aplica mientras está PENDING
          [orderId]: {
            ...current,
            status,
            expiresAt: status === OrderStatusEnum.PENDING ? current.expiresAt : null,
          },
        },
      }));
    return true;
  },

  applyOrderDTO: (order) => {
    const current = get().orders[order.id];
    if (!current) return;
    if (isFinalStatus(order.status)) get().remove(order.id);
    else set((s) => ({ orders: { ...s.orders, [order.id]: mergeOrderDTO(current, order) } }));
  },

  remove: (orderId) =>
    set((s) => {
      if (!s.orders[orderId]) return s;
      const rest = { ...s.orders };
      delete rest[orderId];
      return { orders: rest };
    }),

  reset: () => set({ orders: {}, loadStatus: "idle" }),
}));

/** Pedidos de la bandeja, del más antiguo al más nuevo. */
export function sortByOldest(orders: Record<string, WhatsappOrder>): WhatsappOrder[] {
  return Object.values(orders).sort(
    (a, b) =>
      new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
  );
}

export const usePendingWhatsappCount = () =>
  useWhatsappOrdersStore(
    (s) =>
      Object.values(s.orders).filter((o) => o.status === OrderStatusEnum.PENDING)
        .length,
  );
