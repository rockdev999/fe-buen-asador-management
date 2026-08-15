import { IngredientUnitEnum } from "@/constants";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface Recipe {
  id: UUID;
  product: { id: UUID; name: string };
  ingredient: { id: UUID; name: string; unitOfMeasure: IngredientUnitEnum };
  quantityUsed: number;
  audit: Audit;
}
