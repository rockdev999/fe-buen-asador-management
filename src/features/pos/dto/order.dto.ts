import {
  OrderEnum,
  OrderItemStatusEnum,
  OrderStatusEnum,
  OrderTypeEnum,
} from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

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
  modifiers:
    | {
        modifierId: UUID;
      }[]
    | [];
}

export interface CreateOrderDTO {
  type: OrderTypeEnum;
  channel: OrderEnum;
  initialStatus?: OrderStatusEnum;
  items: CreateOrderItemDTO[];
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  deliveryReference?: string | null;
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
  status?: OrderItemStatusEnum;
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
  deliveryAddress?: string | null;
  deliveryReference?: string | null;
  items: OrderItemDTO[];
  subtotal: number;
  total: number;
  audit: Audit;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatusEnum;
}

export interface OrderPageItemDTO {
  id: UUID;
  customerName: string | null;
  channel: OrderEnum;
  type: OrderTypeEnum;
  status: OrderStatusEnum;
  subtotal: number;
  updatedAt: string | null;
}

export interface ManagerOrderPageItemDTO extends OrderPageItemDTO {
  location: {
    id: UUID;
    name: string;
  };
}
