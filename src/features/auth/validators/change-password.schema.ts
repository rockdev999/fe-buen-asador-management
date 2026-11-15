import { t } from "@/locales/es";
import { z } from "zod";

const v = t.auth.validation;

// Mismas reglas que valida el backend para la nueva contraseña.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, v.currentPasswordRequired),
    newPassword: z
      .string()
      .min(1, v.newPasswordRequired)
      .min(8, v.newPasswordMin)
      .max(50, v.newPasswordMax)
      .regex(/[A-Z]/, v.newPasswordUppercase)
      .regex(/[a-z]/, v.newPasswordLowercase)
      .regex(/\d/, v.newPasswordNumber),
    // Solo se valida en el frontend; no se envía.
    confirmPassword: z.string().min(1, v.confirmPasswordRequired),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: v.newPasswordSameAsCurrent,
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: v.passwordsMustMatch,
    path: ["confirmPassword"],
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
