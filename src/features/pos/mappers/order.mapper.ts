import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import {
  CreateOrderDTO,
  ManagerOrderPageItemDTO,
  ModifierItemDTO,
  OrderDTO,
  OrderItemDTO,
  OrderPageItemDTO,
} from "../dto/order.dto";
import { CartItem } from "../models/cart";
import {
  ManagerOrderPageItem,
  ModifierSaleItem,
  Order,
  OrderItem,
  OrderPageItem,
  OrderSaleItem,
} from "../models/order";
import { OrderSnapshot } from "../models/order-snapshot";

export function mapOrderDTOToSnapshot(dto: OrderDTO): OrderSnapshot {
  return {
    id: dto.id,
    status: dto.status as OrderStatusEnum,
    orderType: dto.type as OrderTypeEnum,
    orderChannel: dto.channel as OrderEnum,
    customerName: dto.customerName ?? null,
    customerPhone: dto.customerPhone ?? null,
    customerAddress: dto.deliveryAddress ?? null,
    deliveryReference: dto.deliveryReference ?? null,
    subtotal: dto.subtotal,
    total: dto.total,
    items: dto.items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: Number(item.unitPrice),
      quantity: item.quantity,
      notes: item.notes ?? "",
      haveModifiers: item.modifiers.length > 0,
      modifiers: [],
      units:
        item.modifiers.length > 0
          ? [
              {
                unitId: item.id,
                modifiers: item.modifiers.map((m) => ({
                  id: m.modifier.id,
                  name: m.modifier.name,
                  extraPrice: Number(m.extraPrice),
                })),
                notes: item.notes ?? "",
              },
            ]
          : [{ unitId: item.id, modifiers: [], notes: item.notes ?? "" }],
    })),
  };
}

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
    customerAddress: dto.deliveryAddress ?? null,
    deliveryReference: dto.deliveryReference ?? null,
    items,
    total: Math.round(items.reduce((s, i) => s + i.subtotal, 0) * 100) / 100,
    audit: dto.audit,
  };
};

// Cart → CreateOrderDTO
export const mapCartToCreateOrderDTO = (
  items: CartItem[],
  orderType: OrderTypeEnum,
  orderChannel: OrderEnum,
  customerName: string | null,
  customerPhone: string | null,
  customerAddress: string | null,
  deliveryReference: string | null,
  initialStatus?: OrderStatusEnum,
): CreateOrderDTO => {
  const flatItems = items.flatMap((item) =>
    item.units.map((unit) => ({
      productId: item.productId,
      quantity: 1,
      notes: unit.notes || item.notes,
      modifiers: unit.modifiers.map((m) => ({ modifierId: m.id })),
    })),
  );
  if (orderType === OrderTypeEnum.DELIVERY) {
    if (!customerName || !customerPhone || !customerAddress) {
      throw new Error(
        "Para órdenes de delivery, se requieren nombre, teléfono y dirección del cliente.",
      );
    }
    return {
      type: orderType,
      channel: orderChannel,
      initialStatus: initialStatus,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      deliveryReference: deliveryReference,
      items: flatItems,
    };
  }

  if (orderType === OrderTypeEnum.TAKEAWAY) {
    if (!customerName) {
      throw new Error(
        "Para órdenes para llevar, se requiere el nombre del cliente.",
      );
    }
    return {
      type: orderType,
      channel: orderChannel,
      initialStatus: initialStatus,
      customerName: customerName || null,
      items: flatItems,
    };
  }
  return {
    type: orderType,
    channel: orderChannel,
    initialStatus: initialStatus,
    customerName: customerName || null,
    items: flatItems,
  };
};

export const mapModifierSaleItemDTOToModel = (
  dto: ModifierItemDTO,
): ModifierSaleItem => ({
  id: dto.id,
  modifier: {
    id: dto.modifier.id,
    name: dto.modifier.name,
  },
  extraPrice: dto.extraPrice,
});

export const mapOrderSaleItemDTOToModel = (
  dto: OrderItemDTO,
  itemSubtotal: number,
): OrderSaleItem => ({
  id: dto.id,
  product: {
    id: dto.product.id,
    name: dto.product.name,
    price: dto.product.price,
  },
  quantity: dto.quantity,
  unitPrice: dto.unitPrice,
  notes: dto.notes,
  modifiers: dto.modifiers.map(mapModifierSaleItemDTOToModel),
  itemSubtotal,
});

export const mapOrderPageItemDTOToModel = (
  dto: OrderPageItemDTO,
): OrderPageItem => ({
  id: dto.id,
  customerName: dto.customerName,
  channel: dto.channel,
  type: dto.type,
  status: dto.status,
  subtotal: dto.subtotal,
  updatedAt: dto.updatedAt,
});

export const mapManagerOrderPageItemDTOToModel = (
  dto: ManagerOrderPageItemDTO,
): ManagerOrderPageItem => ({
  ...mapOrderPageItemDTOToModel(dto),
  locationId: dto.location.id,
  locationName: dto.location.name,
});
