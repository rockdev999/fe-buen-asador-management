import { t } from "@/locales/es";
import { z } from "zod";

const v = t.auth.validation;

export const loginSchema = z.object({
  email: z.string().min(1, v.emailRequired).email(v.emailInvalid),
  password: z.string().min(1, v.passwordRequired),
});
