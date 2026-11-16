import { OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { WhatsappOrder } from "../models/whatsapp-order.model";

export interface NextStep {
  status: OrderStatusEnum;
  label: string;
}

/** Siguiente paso que dispara cada estado (ver tabla de transiciones del BE). */
const NEXT_STEP: Partial<Record<OrderStatusEnum, NextStep>> = {
  // PENDING → READY también es válido en el backend, pero se obliga a
  // aprobar: esa transición es la que envía la confirmación y el QR.
  [OrderStatusEnum.PENDING]: { status: OrderStatusEnum.CONFIRMED, label: "Aprobar" },
  [OrderStatusEnum.CONFIRMED]: { status: OrderStatusEnum.PREPARING, label: "Preparar" },
  [OrderStatusEnum.PREPARING]: { status: OrderStatusEnum.READY, label: "Listo" },
};

// Cobro: POST /sales acepta READY y DELIVERED (delivery con pago al entregar).
const CHARGEABLE: OrderStatusEnum[] = [OrderStatusEnum.READY, OrderStatusEnum.DELIVERED];

const CANCELLABLE: OrderStatusEnum[] = [
  OrderStatusEnum.PENDING,
  OrderStatusEnum.CONFIRMED,
  OrderStatusEnum.PREPARING,
  OrderStatusEnum.READY,
];

/** Qué puede hacer el usuario con el pedido según su estado y su rol. */
export function getOrderActions(
  order: WhatsappOrder,
  perms: { canChangeStatus: boolean; canCharge: boolean },
) {
  const isDelivery = order.type === OrderTypeEnum.DELIVERY;
  // Delivery: READY → DELIVERED cuando sale el repartidor (se cobra igual).
  const next: NextStep | undefined =
    isDelivery && order.status === OrderStatusEnum.READY
      ? { status: OrderStatusEnum.DELIVERED, label: "Entregado" }
      : NEXT_STEP[order.status];
  const isChargeable = CHARGEABLE.includes(order.status);

  return {
    next: perms.canChangeStatus ? next : undefined,
    canCharge: perms.canChangeStatus && perms.canCharge && isChargeable,
    canCancel: perms.canChangeStatus && CANCELLABLE.includes(order.status),
    /** Cobrable, pero el usuario no es cajero (ADMIN). */
    chargeByCashierOnly: perms.canChangeStatus && !perms.canCharge && isChargeable,
    isReject: order.status === OrderStatusEnum.PENDING,
  };
}

const URL_RE = /https?:\/\/\S+/gi;

/** Separa el texto de la dirección de los links (p. ej. Google Maps). */
export function splitAddress(address: string) {
  const links = address.match(URL_RE) ?? [];
  const text = address.replace(URL_RE, "").replace(/\s{2,}/g, " ").trim();
  return { text, links };
}
