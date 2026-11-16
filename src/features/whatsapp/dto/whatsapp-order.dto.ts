import { OrderStatusEnum } from "@/constants";
import { OrderDTO } from "@/features/pos/dto/order.dto";
import { ISODateTimeString, UUID } from "@/types/common";

/** Cómo dijo el cliente que va a pagar al armar el pedido por WhatsApp. */
export enum WhatsappPaymentPreferenceEnum {
  CASH = "CASH",
  QR = "QR",
}

/**
 * Elemento de GET /whatsapp/orders y payload del evento SSE `whatsapp-order`.
 * `paymentPreference` solo viene aquí (no en GET /orders/:id).
 */
export interface WhatsappOrderDTO {
  order: OrderDTO;
  whatsapp: {
    /** wa_id sin "+", ej. "59171234567". */
    phone: string;
    paymentPreference: WhatsappPaymentPreferenceEnum;
  };
}

/** Payload del evento SSE `order-status`. */
export interface OrderStatusEventDTO {
  orderId: UUID;
  locationId: UUID;
  status: OrderStatusEnum;
  /** Solo en algunos eventos, p. ej. al anular una venta: 'PAID'. */
  previousStatus?: OrderStatusEnum;
  changedAt: ISODateTimeString;
}
