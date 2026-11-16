import { OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { ISODateTimeString, UUID } from "@/types/common";
import { WhatsappPaymentPreferenceEnum } from "../dto/whatsapp-order.dto";

/** Ítems agrupados: el backend envía una fila por unidad. */
export interface WhatsappOrderLine {
  key: string;
  name: string;
  quantity: number;
  modifiers: string[];
  notes: string | null;
  /** Precio de todas las unidades, con modificadores. */
  total: number;
}

export interface WhatsappOrder {
  id: UUID;
  /** Código que recibe el cliente: primeros 8 caracteres del id en mayúsculas. */
  shortId: string;
  status: OrderStatusEnum;
  type: OrderTypeEnum;
  locationId: UUID;
  locationName: string;
  customerName: string | null;
  customerPhone: string | null;
  /** wa_id sin "+", listo para https://wa.me/<waPhone>. */
  waPhone: string;
  deliveryAddress: string | null;
  deliveryReference: string | null;
  paymentPreference: WhatsappPaymentPreferenceEnum;
  lines: WhatsappOrderLine[];
  subtotal: number;
  total: number;
  createdAt: ISODateTimeString | null;
}
