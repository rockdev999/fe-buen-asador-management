import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { CartItem } from "./cart";

export interface OrderSnapshot {
  id?: string;
  items: CartItem[];
  orderType: OrderTypeEnum;
  orderChannel: OrderEnum;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  deliveryReference: string | null;
  status?: OrderStatusEnum;
  cancellationReason?: string | null;
  subtotal: number;
  discount?: number;
  total: number;
}
