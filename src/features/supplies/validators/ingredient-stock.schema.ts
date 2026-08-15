import { z } from "zod";
import { t } from "@/locales/es";
import { AdjustmentType } from "@/constants";

const v = t.supplies.stock.validation;

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};
const stringToNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return Number(value);
  return value;
};

const quantityField = z.preprocess(
  stringToNumber,
  z
    .number({
      error: (issue) =>
        issue.input === undefined ? v.quantityRequired : v.quantityInvalid,
    })
    .min(0, { error: v.quantityMin })
    .max(999999, { error: v.quantityMax }),
);

const unitCostField = z.preprocess(
  stringToNumber,
  z
    .number({ error: v.unitCostInvalid })
    .positive({ error: v.unitCostPositive })
    .max(999999, { error: v.unitCostMax })
    .optional(),
);

const notesField = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(500, { error: v.notesMax }).optional(),
);

export const adjustIngredientStockSchema = z.object({
  ingredientId: z.string().min(1, { error: v.ingredientRequired }).uuid(),
  adjustmentType: z.nativeEnum(AdjustmentType, {
    message: v.adjustmentTypeRequired,
  }),
  quantity: quantityField,
  unitCost: unitCostField,
  notes: notesField,
});

export type AdjustIngredientStockForm = z.infer<
  typeof adjustIngredientStockSchema
>;

export const createIngredientStockSchema = z.object({
  locationId: z.string().min(1, { error: v.locationRequired }).uuid(),
  ingredientId: z.string().min(1, { error: v.ingredientRequired }).uuid(),
  quantity: quantityField,
  unitCost: unitCostField,
  notes: notesField,
});

export type CreateIngredientStockForm = z.infer<
  typeof createIngredientStockSchema
>;
