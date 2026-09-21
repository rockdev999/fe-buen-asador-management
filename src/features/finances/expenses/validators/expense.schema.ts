import { z } from "zod";
import { t } from "@/locales/es";

const v = t.finances.expense.validation;

// Mismo shape para crear y editar — el backend usa el mismo DTO para ambos.
export const expenseSchema = z.object({
  categoryId: z.string().min(1, v.categoryRequired),
  description: z.string().trim().min(1, v.descriptionRequired).max(500),
  amount: z.number().positive(v.amountPositive),
  receiptUrl: z.string().max(500).optional(),
});

export type ExpenseForm = z.infer<typeof expenseSchema>;
