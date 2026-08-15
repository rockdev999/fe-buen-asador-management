import { z } from "zod";
import { t } from "@/locales/es";
import { AdjustmentType } from "@/constants";

const v = t.inventory.stock.validation;

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};
const stringToNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return Number(value);
  return value;
};

export const adjustStockSchema = z.object({
  productId: z.string().min(1, { error: v.productRequired }).uuid(),
  adjustmentType: z.nativeEnum(AdjustmentType, {
    message: v.adjustmentTypeRequired,
  }),
  quantity: z.preprocess(
    stringToNumber,
    z
      .number({
        error: (issue) =>
          issue.input === undefined ? v.quantityRequired : v.quantityInvalid,
      })
      .min(0, { error: v.quantityMin })
      .max(999999, { error: v.quantityMax }),
  ),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500, { error: v.notesMax }).optional(),
  ),
});

export type AdjustStockForm = z.infer<typeof adjustStockSchema>;

export const createStockSchema = z.object({
  locationId: z.string().min(1, { error: v.locationRequired }).uuid(),
  productId: z.string().min(1, { error: v.productRequired }).uuid(),
  quantity: z.preprocess(
    stringToNumber,
    z
      .number({
        error: (issue) =>
          issue.input === undefined ? v.quantityRequired : v.quantityInvalid,
      })
      .min(0, { error: v.quantityMin })
      .max(999999, { error: v.quantityMax }),
  ),
  notes: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500, { error: v.notesMax }).optional(),
  ),
});

export type CreateStockForm = z.infer<typeof createStockSchema>;
