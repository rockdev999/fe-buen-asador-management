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
  // 0 es válido: modificador gratis (el backend lo acepta al crear y editar).
  extraPrice: z
    .number({ error: v.extraPriceRequired })
    .min(0, v.extraPricePositive)
    .max(999999, v.extraPriceMax),
  active: z.boolean().optional(),
  locationIds: z
    .array(z.string().uuid({ error: v.locationInvalid }))
    .min(1, { error: v.locationRequired }),
  // Precio extra propio por sucursal; null = usa el general, 0 = gratis.
  locationPrices: z
    .array(
      z.object({
        locationId: z.string().uuid({ error: v.locationInvalid }),
        extraPrice: z
          .number({ error: v.locationPriceInvalid })
          .min(0, v.locationPriceMin)
          .max(999999, v.locationPriceMax)
          .nullable(),
      }),
    )
    .optional(),
});

export type CreateModifierForm = z.infer<typeof modifierCreateSchema>;
