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
    /**
     * Cuándo lo cancela el sistema si nadie lo aprueba (ISO UTC). Solo en
     * PENDING; null fuera de PENDING o con el plazo desactivado.
     */
    expiresAt: ISODateTimeString | null;
  };
}

/** Payload del evento SSE `order-status`. */
export interface OrderStatusEventDTO {
  orderId: UUID;
  locationId: UUID;
  previousStatus: OrderStatusEnum;
  status: OrderStatusEnum;
  /** Motivo, solo en CANCELLED. */
  reason: string | null;
  /** true = lo canceló el sistema porque nadie lo aprobó a tiempo. */
  automatic: boolean;
  changedAt: ISODateTimeString;
}
