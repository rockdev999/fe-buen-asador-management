import { OrderEnum, OrderTypeEnum } from "@/constants";
import {
  CreateOrderDeliveryDTO,
  CreateOrderInPersonDTO,
  OrderDTO,
  OrderItemDTO,
} from "../dto/order.dto";
import { CartItem } from "../models/cart";
import { Order, OrderItem } from "../models/order";

export const mapOrderItemDTOToModel = (dto: OrderItemDTO): OrderItem => {
  const modifiersTotal = dto.modifiers.reduce((s, m) => s + m.extraPrice, 0);
  return {
    id: dto.id,
    productId: dto.product.id,
    name: dto.product.name,
    unitPrice: dto.unitPrice,
    quantity: dto.quantity,
    notes: dto.notes,
    modifiers: dto.modifiers.map((m) => ({
      id: m.id,
      name: m.modifier.name,
      extraPrice: m.extraPrice,
    })),
    subtotal: (dto.unitPrice + modifiersTotal) * dto.quantity,
  };
};

export const mapOrderDTOToModel = (dto: OrderDTO): Order => {
  const items = dto.items.map(mapOrderItemDTOToModel);
  return {
    id: dto.id,
    type: dto.type,
    channel: dto.channel,
    status: dto.status,
    locationName: dto.location.name,
    customerName: dto.customerName ?? null,
    customerPhone: dto.customerPhone ?? null,
    customerAddress: dto.customerAddress ?? null,
    deliveryReference: dto.deliveryReference ?? null,
    items,
    total: Math.round(items.reduce((s, i) => s + i.subtotal, 0) * 100) / 100,
    createdAt: dto.createdAt,
  };
};

// Cart → CreateOrderInPersonDTO
export const mapCartToCreateOrderInPersonDTO = (
  items: CartItem[],
  orderType: OrderTypeEnum,
  orderChannel: OrderEnum,
  customerName: string,
): CreateOrderInPersonDTO => {
  return {
    type: orderType,
    channel: orderChannel,
    customerName: customerName || "Cliente",
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      notes: item.notes,
      modifiers: [],
    })),
  };
};

// Cart → CreateOrderInPersonDTO
export const mapCartToCreateOrderDeliveryDTO = (
  items: CartItem[],
  orderType: OrderTypeEnum,
  orderChannel: OrderEnum,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  deliveryReference: string,
): CreateOrderDeliveryDTO => {
  return {
    type: orderType,
    channel: orderChannel,
    customerName: customerName || "Cliente",
    customerPhone: customerPhone || "00000000",
    customerAddress: customerAddress || "N/A",
    deliveryReference: deliveryReference || "N/A",
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      notes: item.notes,
      modifiers: [],
    })),
  };
};
