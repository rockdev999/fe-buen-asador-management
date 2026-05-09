import { UUID } from "@/types/common";
import { Modifier } from "./modifier";

export interface CartItemUnit {
  unitId: string;
  modifiers: Modifier[];
  notes: string;
}

export interface CartItem {
  productId: UUID;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  haveModifiers: boolean;
  modifiers: Modifier[];
  units: CartItemUnit[];
}
