import {
  OrderEnum,
  OrderItemStatusEnum,
  OrderStatusEnum,
  OrderTypeEnum,
} from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ModifierItemDTO {
  id: UUID;
  modifier: {
    id: UUID;
    name: string;
  };
  extraPrice: number;
}

export interface CreateOrderItemDTO {
  productId: UUID;
  quantity: number;
  notes: string;
  modifiers: ModifierItemDTO[];
}

interface BaseOrderDTO {
  type: OrderTypeEnum;
  channel: OrderEnum;
  items: CreateOrderItemDTO[];
}

export interface CreateOrderInPersonDTO extends BaseOrderDTO {
  customerName: string;
}

export interface CreateOrderDeliveryDTO extends BaseOrderDTO {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryReference: string;
}

export interface OrderItemDTO {
  id: UUID;
  product: {
    id: UUID;
    name: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  notes: string;
  status: OrderItemStatusEnum;
  modifiers: ModifierItemDTO[];
}

export interface OrderDTO {
  id: UUID;
  type: OrderTypeEnum;
  channel: OrderEnum;
  status: OrderStatusEnum;
  location: LocationDTO;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  deliveryReference?: string | null;
  items: OrderItemDTO[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatusEnum;
}
