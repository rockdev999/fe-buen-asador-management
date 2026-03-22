import { t } from "@/locales/es";
import { z } from "zod";

const v = t.validation;

export const loginSchema = z.object({
  email: z.string().min(1, v.required).email(v.email),
  password: z.string().min(1, v.required),
});

export type LoginForm = z.infer<typeof loginSchema>;
