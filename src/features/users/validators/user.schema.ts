import { z } from "zod";
import { t } from "@/locales/es";
import { RoleEnum } from "@/constants/enums";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

const v = t.users.validation;

export const userSchema = z.object({
  firstName: z.string().min(2, v.firstNameMin).max(50, v.firstNameMax),
  lastName: z.string().min(2, v.lastNameMin).max(50, v.lastNameMax),
  email: z.string().email(v.emailInvalid),
  password: z.string().min(8, v.passwordMin).max(50, v.passwordMax),
  role: z.nativeEnum(RoleEnum, { message: v.roleRequired }),
  locationId: z.string().uuid().optional(),
});

export type UserForm = z.infer<typeof userSchema>;

export const userCreateSchema = z
  .object({
    firstName: z
      .string()
      .min(1, v.firstNameRequired)
      .min(2, v.firstNameMin)
      .max(50, v.firstNameMax)
      .trim(),
    lastName: z
      .string()
      .min(1, v.lastNameRequired)
      .min(2, v.lastNameMin)
      .max(50, v.lastNameMax)
      .trim(),
    username: z
      .string()
      .min(1, v.usernameRequired)
      .min(2, v.usernameMin)
      .max(30, v.usernameMax)
      .trim(),
    email: z
      .string()
      .min(1, v.emailRequired)
      .email(v.emailInvalid)
      .trim()
      .toLowerCase(),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9+\-() ]+$/.test(val), {
        message: v.phoneInvalid,
      })
      .refine((val) => !val || val.length <= 20, {
        message: v.phoneMax,
      }),
    description: z.string().max(200, v.descriptionMax).trim().optional(),
    positions: z.array(z.nativeEnum(JobPositionEnum)).optional(),
    password: z
      .string()
      .min(1, v.passwordRequired)
      .min(8, v.passwordMin)
      .max(50, v.passwordMax)
      .trim(),
    repitPassword: z.string().min(1, v.passwordConfirmRequired),
  })
  .refine((data) => data.password === data.repitPassword, {
    message: v.passwordsMustMatch,
    path: ["repitPassword"],
  });

export const userUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, v.firstNameRequired)
    .min(2, v.firstNameMin)
    .max(50, v.firstNameMax)
    .trim(),
  lastName: z
    .string()
    .min(1, v.lastNameRequired)
    .min(2, v.lastNameMin)
    .max(50, v.lastNameMax)
    .trim(),
  description: z.string().max(200, v.descriptionMax).trim().optional(),
  positions: z.array(z.nativeEnum(JobPositionEnum)).optional(),
});

export type CreateUserForm = z.infer<typeof userCreateSchema>;
export type UpdateUserForm = z.infer<typeof userUpdateSchema>;
