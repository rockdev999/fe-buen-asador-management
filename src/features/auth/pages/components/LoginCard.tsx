import { t } from "@/locales/es";
import { useLogin } from "../../hooks/useLogin";
import { LoginForm } from "../../forms/login.form";
import { useFormik } from "formik";
import { loginFormConfig } from "../../forms/login.form-config";
import { FormInput } from "@/components/shared/Form/FormInput";
import { FormPassword } from "@/components/shared/Form/FormPassword";
import { Button } from "@/components/shared/Basics/Button";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { ForgotPasswordCard } from "./ForgotPasswordCard";

const trans = t.auth.login;

interface LoginCardProps {
  /** Mantiene el botón en carga tras el login (p. ej. mientras se entra como MANAGER). */
  isFinishing?: boolean;
}

export function LoginCard({ isFinishing = false }: LoginCardProps) {
  const { mutate: login, status } = useLogin();
  const [showForgot, setShowForgot] = useState(false);
  /** Mensaje del backend tras pedir la contraseña temporal. */
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandlerBlur,
    handleChange: formHandleChange,
    handleSubmit: formHandleSubmit,
    setFieldValue,
  } = useFormik<LoginForm>({
    initialValues: loginFormConfig.initialValues,
    validate: loginFormConfig.validationSchema,
    onSubmit: (data) => login(data),
  });

  if (showForgot) {
    return (
      <ForgotPasswordCard
        initialIdentifier={formValues.identifier}
        onBack={(identifier, sentMessage) => {
          if (identifier) void setFieldValue("identifier", identifier, false);
          // Tras enviarla, la contraseña de siempre ya no es la que usará.
          if (sentMessage) void setFieldValue("password", "", false);
          setForgotMessage(sentMessage ?? null);
          setShowForgot(false);
        }}
      />
    );
  }

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

      {forgotMessage && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-left"
        >
          <MailCheck size={15} className="mt-0.5 shrink-0 text-brand" />
          <div className="text-[12px] leading-4">
            <p className="text-inkblack">{forgotMessage}</p>
            <p className="mt-1 text-muted-foreground">
              {t.auth.forgotPassword.nextStep}
            </p>
          </div>
        </div>
      )}
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
          onClick={() => setShowForgot(true)}
        >
          {trans.forgotPassword}
        </Button>
      </div>
      <Button
        type="submit"
        isLoading={status === "pending" || isFinishing}
        className="w-full"
      >
        {trans.submit}
      </Button>
    </form>
  );
}
