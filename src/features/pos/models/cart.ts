import { UUID } from "@/types/common";
import { Modifier } from "./modifier";

export interface CartItem {
  productId: UUID;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  modifiers: Modifier[];
}
