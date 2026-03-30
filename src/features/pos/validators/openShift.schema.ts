import { t } from "@/locales/es";
import z from "zod";

const v = t.pos.shiftModal.validation;

export const openShiftSchema = z.object({
  initialAmount: z
    .number()
    .min(1, v.initialAmountMin)
    .max(100000000, v.initialAmountMax),
});
