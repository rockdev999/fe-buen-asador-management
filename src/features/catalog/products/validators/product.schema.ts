import { z } from "zod";
import { t } from "@/locales/es";

const v = t.catalog.products.validation;

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

const stringToNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return Number(value);
  return value;
};

export const productCreateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, { error: v.nameRequired })
    .min(2, { error: v.nameMin })
    .max(150, { error: v.nameMax }),

  brand: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(255, { error: v.brandMax }).optional(),
  ),

  description: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500, { error: v.descriptionMax }).optional(),
  ),

  imageUrl: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .url({ error: v.imageUrlInvalid })
      .max(500, { error: v.imageUrlMax })
      .optional(),
  ),

  price: z.preprocess(
    stringToNumber,
    z
      .number({
        error: (issue) =>
          issue.input === undefined ? v.priceRequired : v.priceInvalid,
      })
      .positive({ error: v.pricePositive })
      .max(999999, { error: v.priceMax }),
  ),

  available: z.boolean({
    error: (issue) =>
      issue.input === undefined ? v.availableRequired : v.availableInvalid,
  }),

  isQuantifiable: z.boolean({
    error: (issue) =>
      issue.input === undefined
        ? v.isQuantifiableRequired
        : v.isQuantifiableInvalid,
  }),

  sortOrder: z.preprocess(
    stringToNumber,
    z
      .number({
        error: (issue) =>
          issue.input === undefined ? v.sortOrderRequired : v.sortOrderInvalid,
      })
      .int({ error: v.sortOrderInteger })
      .min(0, { error: v.sortOrderMin }),
  ),

  haveModifiers: z.boolean({
    error: (issue) =>
      issue.input === undefined
        ? v.haveModifiersRequired
        : v.haveModifiersInvalid,
  }),

  locationId: z
    .string()
    .min(1, { error: v.locationRequired })
    .uuid({ error: v.locationInvalid }),

  categoryId: z
    .string()
    .min(1, { error: v.categoryRequired })
    .uuid({ error: v.categoryInvalid }),
});

export type CreateProductForm = z.infer<typeof productCreateSchema>;
