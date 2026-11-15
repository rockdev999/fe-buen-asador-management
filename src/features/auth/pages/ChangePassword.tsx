import { useFormik } from "formik";
import { Navigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { t } from "@/locales/es";
import { getInitials } from "@/lib/utils";
import { zodToFormik } from "@/lib/zodToFormik";
import { getHomePath } from "@/routes/home-path";
import { FormPassword } from "@/components/shared/Form/FormPassword";
import { Button } from "@/components/shared/Basics/Button";
import { logoutSession } from "@/services/auth/session.service";
import { useAuth } from "../hooks/useAuth";
import { useChangePassword } from "../hooks/useChangePassword";
import { useSessionKeepAlive } from "../hooks/useSessionKeepAlive";
import {
  ChangePasswordForm,
  changePasswordSchema,
} from "../validators/change-password.schema";
import { AuthLayout } from "./components/AuthLayout";

const trans = t.auth.changePassword;

const initialValues: ChangePasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/**
 * Cambio obligatorio de la contraseña temporal. Vive fuera de AppLayout:
 * mientras esté pendiente, el backend solo responde change-password,
 * my-locations, el SSE, refresh y logout.
 */
export const ChangePassword = () => {
  const { user } = useAuth();
  const { mutate: changePassword, status } = useChangePassword();

  // La sesión puede quedarse aquí un rato mientras el usuario escribe.
  useSessionKeepAlive();

  const { values, touched, errors, handleBlur, handleChange, handleSubmit } =
    useFormik<ChangePasswordForm>({
      initialValues,
      validate: zodToFormik(changePasswordSchema),
      onSubmit: (form) => changePassword(form),
    });

  // Sin cambio pendiente (p. ej. ya lo hizo en otra pestaña): al inicio.
  if (user && !user.mustChangePassword) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return (
    <AuthLayout
      step={3}
      title={trans.brand.tagline}
      description={trans.brand.description}
      userName={user?.name}
      userEmail={user?.email}
      userInitials={user ? getInitials(user.name) : undefined}
      card={
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1">
          <div className="mb-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <KeyRound size={18} />
            </div>
            <h2 className="text-xl font-medium text-inkblack mb-1">
              {trans.title}
            </h2>
            <p className="text-sm text-muted-foreground">{trans.subtitle}</p>
          </div>

          <FormPassword
            required
            id="currentPassword"
            name="currentPassword"
            label={trans.currentPassword}
            autoComplete="current-password"
            value={values.currentPassword}
            onBlur={handleBlur}
            onChange={handleChange}
            touched={touched.currentPassword}
            error={errors.currentPassword}
          />
          <p className="-mt-0.5 mb-2 text-[11px] text-muted-foreground">
            {trans.currentPasswordHint}
          </p>

          <FormPassword
            required
            id="newPassword"
            name="newPassword"
            label={trans.newPassword}
            autoComplete="new-password"
            value={values.newPassword}
            onBlur={handleBlur}
            onChange={handleChange}
            touched={touched.newPassword}
            error={errors.newPassword}
          />
          <p className="-mt-0.5 mb-2 text-[11px] text-muted-foreground">
            {trans.rules}
          </p>

          <FormPassword
            required
            id="confirmPassword"
            name="confirmPassword"
            label={trans.confirmPassword}
            autoComplete="new-password"
            value={values.confirmPassword}
            onBlur={handleBlur}
            onChange={handleChange}
            touched={touched.confirmPassword}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            isLoading={status === "pending"}
            className="mt-3 w-full"
          >
            {trans.submit}
          </Button>

          <button
            type="button"
            onClick={() => logoutSession()}
            className="mt-4 block w-full text-center text-xs text-brand transition-colors hover:text-brand-dark"
          >
            {trans.logout}
          </button>
        </form>
      }
    />
  );
};
