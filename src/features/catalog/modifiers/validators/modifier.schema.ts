import { z } from "zod";
import { t } from "@/locales/es";

const v = t.catalog.modifier.validation;

export const modifierCreateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, v.nameRequired)
    .min(2, v.nameMin)
    .max(150, v.nameMax)
    .trim(),
  extraPrice: z
    .number()
    .min(1, v.extraPriceRequired)
    .min(1, v.extraPricePositive)
    .max(999999, v.extraPriceMax),
  active: z.boolean().optional(),
  location: z.object({
    id: z.string().uuid(v.locationInvalid),
    name: z.string().min(1, v.locationRequired).trim(),
  }),
});

export type CreateModifierForm = z.infer<typeof modifierCreateSchema>;
