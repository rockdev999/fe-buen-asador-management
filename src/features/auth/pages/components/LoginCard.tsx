import { t } from "@/locales/es";
import { useLogin } from "../../hooks/useLogin";
import { LoginForm } from "../../forms/login.form";
import { useFormik } from "formik";
import { loginFormConfig } from "../../forms/login.form-config";
import { FormInput } from "@/components/shared/Form/FormInput";
import { FormPassword } from "@/components/shared/Form/FormPassword";
import { Button } from "@/components/shared/Basics/Button";
import { Info } from "lucide-react";
import { useState } from "react";

const trans = t.auth.login;

interface LoginCardProps {
  /** Mantiene el botón en carga tras el login (p. ej. mientras se entra como MANAGER). */
  isFinishing?: boolean;
}

export function LoginCard({ isFinishing = false }: LoginCardProps) {
  const { mutate: login, status } = useLogin();
  // No hay autoservicio: el gerente restablece la contraseña desde Usuarios.
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandlerBlur,
    handleChange: formHandleChange,
    handleSubmit: formHandleSubmit,
  } = useFormik<LoginForm>({
    initialValues: loginFormConfig.initialValues,
    validate: loginFormConfig.validationSchema,
    onSubmit: (data) => login(data),
  });

  return (
    <form
      onSubmit={formHandleSubmit}
      noValidate
      className="flex flex-col gap-1"
    >
      <div className="mb-7">
        <h2 className="text-xl font-medium text-inkblack mb-1">
          {trans.title}
        </h2>
        <p className="text-sm text-muted-foreground">{trans.subtitle}</p>
      </div>
      <FormInput
        required
        id="identifier"
        name="identifier"
        label={trans.identifier}
        type="text"
        autoComplete="username"
        value={formValues.identifier}
        placeholder={trans.identifierPlaceholder}
        onBlur={formHandlerBlur}
        onChange={formHandleChange}
        touched={formTouched.identifier}
        error={formErrors.identifier}
      />

      <FormPassword
        required
        id="password"
        name="password"
        label={trans.password}
        autoComplete="current-password"
        value={formValues.password}
        placeholder={trans.passwordPlaceholder}
        onBlur={formHandlerBlur}
        onChange={formHandleChange}
        touched={formTouched.password}
        error={formErrors.password}
      />

      <div className="text-right -mt-1 mb-4">
        <Button
          type="button"
          variant="link"
          size="xs"
          aria-expanded={showForgotHelp}
          aria-controls="forgot-password-help"
          onClick={() => setShowForgotHelp((open) => !open)}
        >
          {trans.forgotPassword}
        </Button>
        {showForgotHelp && (
          <p
            id="forgot-password-help"
            role="status"
            className="mt-2 flex items-start gap-2 rounded-xl bg-surface px-3 py-2 text-left text-[12px] text-muted-foreground"
          >
            <Info size={14} className="mt-0.5 shrink-0 text-brand" />
            {trans.forgotPasswordHelp}
          </p>
        )}
      </div>
      <Button type="submit" isLoading={status === "pending" || isFinishing} className="w-full">
        {trans.submit}
      </Button>
    </form>
  );
}
