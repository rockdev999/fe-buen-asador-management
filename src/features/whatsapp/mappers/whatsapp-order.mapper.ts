import { OrderEnum } from "@/constants";
import { OrderDTO, OrderItemDTO } from "@/features/pos/dto/order.dto";
import { shortOrderId } from "@/lib/order-code";
import { WhatsappOrderDTO } from "../dto/whatsapp-order.dto";
import { WhatsappOrder, WhatsappOrderLine } from "../models/whatsapp-order.model";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Agrupa las filas de 1 unidad en "2 × Personal". Se agrupa por producto,
 * modificadores y nota para no esconder diferencias que importan en cocina.
 */
export function groupOrderItems(items: OrderItemDTO[]): WhatsappOrderLine[] {
  const lines = new Map<string, WhatsappOrderLine>();

  for (const item of items) {
    const modifierNames = item.modifiers.map((m) => m.modifier.name).sort();
    const notes = item.notes?.trim() || null;
    const key = [
      item.product.id,
      item.modifiers.map((m) => m.modifier.id).sort().join(","),
      notes ?? "",
    ].join("|");

    const extra = item.modifiers.reduce((s, m) => s + Number(m.extraPrice), 0);
    const qty = item.quantity || 1;
    const lineTotal = (Number(item.unitPrice) + extra) * qty;

    const line = lines.get(key);
    if (line) {
      line.quantity += qty;
      line.total = round2(line.total + lineTotal);
    } else {
      lines.set(key, {
        key,
        name: item.product.name,
        quantity: qty,
        modifiers: modifierNames,
        notes,
        total: round2(lineTotal),
      });
    }
  }

  return [...lines.values()];
}

export function mapWhatsappOrderDTOToModel(dto: WhatsappOrderDTO): WhatsappOrder {
  const { order, whatsapp } = dto;
  return {
    id: order.id,
    shortId: shortOrderId(order.id),
    status: order.status,
    type: order.type,
    locationId: order.location.id,
    locationName: order.location.name,
    customerName: order.customerName ?? null,
    customerPhone: order.customerPhone ?? null,
    waPhone: whatsapp.phone.replace(/^\+/, ""),
    deliveryAddress: order.deliveryAddress ?? null,
    deliveryReference: order.deliveryReference ?? null,
    paymentPreference: whatsapp.paymentPreference,
    lines: groupOrderItems(order.items),
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    createdAt: order.audit?.createdAt ?? null,
  };
}

/**
 * Refresca un pedido ya conocido con la respuesta de PUT /orders/:id/status o
 * GET /orders/:id, que no traen los datos de WhatsApp: se conservan los previos.
 */
export function mergeOrderDTO(prev: WhatsappOrder, order: OrderDTO): WhatsappOrder {
  return mapWhatsappOrderDTOToModel({
    order,
    whatsapp: { phone: prev.waPhone, paymentPreference: prev.paymentPreference },
  });
}

/** Pedidos de WhatsApp en el listado general: ONLINE y creados por el bot. */
export const isWhatsappOrder = (order: Pick<OrderDTO, "channel" | "audit">) =>
  order.channel === OrderEnum.ONLINE && order.audit?.createdBy === null;
