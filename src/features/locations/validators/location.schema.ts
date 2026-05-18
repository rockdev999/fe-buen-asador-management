import { t } from "@/locales/es";
import { z } from "zod";

const v = t.location.validation;

export const locationCreateSchema = z.object({
  name: z
    .string()
    .min(1, v.nameRequired)
    .min(2, v.nameMin)
    .max(100, v.nameMax)
    .trim(),
  address: z.string().max(200, v.addressMax).trim().optional(),
});

export const locationUpdateSchema = z.object({
  name: z
    .string()
    .min(1, v.nameRequired)
    .min(2, v.nameMin)
    .max(100, v.nameMax)
    .trim(),
  address: z.string().max(200, v.addressMax).trim().optional(),
});

export type CreateLocationForm = z.infer<typeof locationCreateSchema>;
export type UpdateLocationForm = z.infer<typeof locationUpdateSchema>;
