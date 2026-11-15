import { UUID } from "@/types/common";
import { Modifier } from "../../catalog/modifiers/models/modifier.model";

/** Lo único que el carrito usa de un modificador; un `Modifier` completo también encaja. */
export type CartModifier = Pick<Modifier, "id" | "name" | "extraPrice">;

export interface CartItemUnit {
  unitId: string;
  modifiers: CartModifier[];
  notes: string;
}

export interface CartItem {
  productId: UUID;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  haveModifiers: boolean;
  modifiers: CartModifier[];
  units: CartItemUnit[];
}
