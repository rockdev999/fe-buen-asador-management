import { OrderEnum, OrderTypeEnum } from "@/constants";
import { CartItem } from "./cart";

export interface OrderSnapshot {
  items: CartItem[];
  orderType: OrderTypeEnum;
  orderChannel: OrderEnum;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  deliveryReference: string | null;
  subtotal: number;
  discount?: number;
  total: number;
}
