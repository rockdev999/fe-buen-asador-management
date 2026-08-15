import { IngredientUnitEnum } from "@/constants";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface RecipeDTO {
  id: UUID;
  product: { id: UUID; name: string };
  ingredient: { id: UUID; name: string; unitOfMeasure: IngredientUnitEnum };
  quantityUsed: number;
  audit: Audit;
}

export interface RecipeIngredientItemDTO {
  ingredientId: UUID;
  quantityUsed: number;
}

export interface CreateRecipeDTO {
  productId: UUID;
  ingredients: RecipeIngredientItemDTO[];
}

export interface UpdateRecipeDTO {
  quantityUsed: number;
}
