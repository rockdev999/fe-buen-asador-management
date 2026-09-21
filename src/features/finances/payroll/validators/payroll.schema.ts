import { z } from "zod";
import { t } from "@/locales/es";

const v = t.finances.payroll.validation;

export const payrollSchema = z.object({
  employeeName: z.string().trim().min(1, v.employeeNameRequired).max(150),
  roleDescription: z.string().max(100).optional(),
  amount: z.number().positive(v.amountPositive),
  notes: z.string().max(500).optional(),
});

export type PayrollForm = z.infer<typeof payrollSchema>;
