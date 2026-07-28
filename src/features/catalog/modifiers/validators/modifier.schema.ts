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
  locationIds: z
    .array(z.string().uuid({ error: v.locationInvalid }))
    .min(1, { error: v.locationRequired }),
});

export type CreateModifierForm = z.infer<typeof modifierCreateSchema>;
