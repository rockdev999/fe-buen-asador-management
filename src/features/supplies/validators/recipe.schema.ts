import { z } from "zod";
import { t } from "@/locales/es";

const v = t.supplies.recipe.validation;

const stringToNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return Number(value);
  return value;
};

const quantityUsedField = z.preprocess(
  stringToNumber,
  z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? v.quantityUsedRequired
          : v.quantityUsedInvalid,
    })
    .positive({ error: v.quantityUsedPositive })
    .max(999999, { error: v.quantityUsedMax }),
);

export const recipeIngredientRowSchema = z.object({
  ingredientId: z.string().min(1, { error: v.ingredientRequired }).uuid(),
  quantityUsed: quantityUsedField,
});

export type RecipeIngredientRowForm = z.infer<typeof recipeIngredientRowSchema>;

export const createRecipeSchema = z
  .object({
    productId: z.string().min(1, { error: v.productRequired }).uuid(),
    ingredients: z
      .array(recipeIngredientRowSchema)
      .min(1, { error: v.ingredientsMin }),
  })
  .refine(
    (data) =>
      new Set(data.ingredients.map((item) => item.ingredientId)).size ===
      data.ingredients.length,
    { message: v.ingredientsDuplicate, path: ["ingredients"] },
  );

export type CreateRecipeForm = z.infer<typeof createRecipeSchema>;

export const updateRecipeQuantitySchema = z.object({
  quantityUsed: quantityUsedField,
});

export type UpdateRecipeQuantityForm = z.infer<
  typeof updateRecipeQuantitySchema
>;
