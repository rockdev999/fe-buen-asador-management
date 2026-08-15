import {
  CreateRecipeDTO,
  RecipeDTO,
  UpdateRecipeDTO,
} from "../dto/recipe.dto";
import { Recipe } from "../models/recipe.model";
import {
  CreateRecipeForm,
  UpdateRecipeQuantityForm,
} from "../validators/recipe.schema";

export const mapRecipeDTOToModel = (dto: RecipeDTO): Recipe => ({
  id: dto.id,
  product: dto.product,
  ingredient: dto.ingredient,
  quantityUsed: dto.quantityUsed,
  audit: dto.audit,
});

export const mapRecipeFormToCreateDTO = (
  form: CreateRecipeForm,
): CreateRecipeDTO => ({
  productId: form.productId,
  ingredients: form.ingredients.map((item) => ({
    ingredientId: item.ingredientId,
    quantityUsed: item.quantityUsed,
  })),
});

export const mapRecipeQuantityFormToUpdateDTO = (
  form: UpdateRecipeQuantityForm,
): UpdateRecipeDTO => ({
  quantityUsed: form.quantityUsed,
});
