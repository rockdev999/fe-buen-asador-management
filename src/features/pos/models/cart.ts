import { UUID } from "@/types/common";

export interface CartItem {
  productId: UUID;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}
