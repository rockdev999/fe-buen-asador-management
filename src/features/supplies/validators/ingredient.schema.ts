import { z } from "zod";
import { t } from "@/locales/es";
import { IngredientUnitEnum } from "@/constants";

const v = t.supplies.ingredient.validation;

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

export const ingredientCreateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, { error: v.nameRequired })
    .min(2, { error: v.nameMin })
    .max(150, { error: v.nameMax }),
  unitOfMeasure: z.nativeEnum(IngredientUnitEnum, {
    message: v.unitOfMeasureRequired,
  }),
  description: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500, { error: v.descriptionMax }).optional(),
  ),
});

export type CreateIngredientForm = z.infer<typeof ingredientCreateSchema>;
