import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { Audit } from "@/types/audit.types";
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
  audit: Audit;
}

export interface ModifierSaleItem {
  id: UUID;
  modifier: {
    id: UUID;
    name: string;
  };
  extraPrice: number;
}

export interface OrderSaleItem {
  id: UUID;
  product: {
    id: UUID;
    name: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  notes: string;
  modifiers: ModifierSaleItem[];
  itemSubtotal: number;
}

export interface OrderPageItem {
  id: UUID;
  customerName: string | null;
  channel: OrderEnum;
  type: OrderTypeEnum;
  status: OrderStatusEnum;
  subtotal: number;
  updatedAt: string | null;
}
