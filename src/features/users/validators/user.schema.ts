import { z } from "zod";
import { t } from "@/locales/es";
import { RoleEnum } from "@/constants/enums";

const v = t.users.validation;

export const userSchema = z.object({
  name: z.string().min(2, v.nameMin).max(100, v.nameMax),
  email: z.string().email(v.emailInvalid),
  password: z.string().min(8, v.passwordMin).max(50, v.passwordMax),
  rol: z.nativeEnum(RoleEnum, { message: v.roleRequired }),
  locationId: z.string().uuid().optional(),
});

export type UserForm = z.infer<typeof userSchema>;

export const userCreateSchema = z
  .object({
    name: z
      .string()
      .min(1, v.nameRequired)
      .min(2, v.nameMin)
      .max(100, v.nameMax)
      .trim(),

    email: z
      .string()
      .min(1, v.emailRequired)
      .email(v.emailInvalid)
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(1, v.passwordRequired)
      .min(8, v.passwordMin)
      .max(50, v.passwordMax),

    repitPassword: z.string().min(1, v.passwordRequired),
  })
  .refine((data) => data.password === data.repitPassword, {
    message: v.passwordsMustMatch,
    path: ["repitPassword"],
  });

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, v.nameRequired)
    .min(2, v.nameMin)
    .max(100, v.nameMax)
    .trim(),

  email: z
    .string()
    .min(1, v.emailRequired)
    .email(v.emailInvalid)
    .trim()
    .toLowerCase(),
});

export type CreateUserForm = z.infer<typeof userCreateSchema>;
export type UpdateUserForm = z.infer<typeof userUpdateSchema>;
