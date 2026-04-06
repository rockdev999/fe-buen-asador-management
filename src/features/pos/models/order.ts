import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { UUID } from "@/types/common";

export interface OrderModifier {
  id: UUID;
  name: string;
  extraPrice: number;
}

export interface OrderItem {
  id: UUID;
  productId: UUID;
  name: string;
  unitPrice: number;
  quantity: number;
  notes: string;
  modifiers: OrderModifier[];
  subtotal: number;
}

export interface Order {
  id: UUID;
  type: OrderTypeEnum;
  channel: OrderEnum;
  status: OrderStatusEnum;
  locationName: string;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  deliveryReference: string | null;
  items: OrderItem[];
  total: number;
  createdAt: string;
}
