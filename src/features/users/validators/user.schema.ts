import { z } from "zod";
import { t } from "@/locales/es";
import { RoleEnum } from "@/constants/enums";

const v = t.users.validation;

export const userSchema = z.object({
  nombre: z.string().min(2, v.nameMin),
  email: z.string().email(v.emailInvalid),
  password: z.string().min(8, v.passwordMin),
  rol: z.nativeEnum(RoleEnum, { message: v.roleRequired }),
  sucursalId: z.string().uuid().optional(),
});

export type UserForm = z.infer<typeof userSchema>;
