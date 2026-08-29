import { t } from "@/locales/es";
import { z } from "zod";

const v = t.auth.validation;

export const loginSchema = z.object({
  identifier: z.string().min(1, v.identifierRequired),
  password: z.string().min(1, v.passwordRequired),
});
