import { z } from "zod";
import { t } from "@/locales/es";

const v = t.catalog.category.validation;

export const categoryCreateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, v.nameRequired)
    .min(2, v.nameMin)
    .max(150, v.nameMax)
    .trim(),
  sortOrder: z.string().min(1, v.sortOrderRequired).default("0"),
});

export type CreateCategoryForm = z.infer<typeof categoryCreateSchema>;
