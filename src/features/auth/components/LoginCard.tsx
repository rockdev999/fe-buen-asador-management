import { t } from "@/locales/es";
import { useLogin } from "../hooks/useLogin";
import { LoginForm } from "../forms/login.form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/Basics/FormField";
import { PasswordField } from "@/components/shared/Interactives/PasswordField";
import { useFormik } from "formik";
import { loginFormConfig } from "../forms/login.form-config";

const trans = t.auth.login;

export function LoginCard() {
  const { mutate: login, status } = useLogin();

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

      <FormField
        id="email"
        name="email"
        type="email"
        label={trans.email}
        placeholder={trans.emailPlaceholder}
        autoComplete="email"
        value={formValues.email}
        error={formTouched.email ? formErrors.email : undefined}
        required
        onChange={formHandleChange}
        onBlur={formHandlerBlur}
      />

      <PasswordField
        id="password"
        name="password"
        label={trans.password}
        placeholder={trans.passwordPlaceholder}
        autoComplete="current-password"
        value={formValues.password}
        error={formTouched.password ? formErrors.password : undefined}
        required
        onChange={formHandleChange}
        onBlur={formHandlerBlur}
      />

      <div className="text-right -mt-1 mb-4">
        <button
          type="button"
          className="text-xs text-brand hover:text-brand-dark transition-colors"
        >
          {trans.forgotPassword}
        </button>
      </div>

      <Button
        type="submit"
        disabled={status === "pending"}
        className="w-full bg-brand hover:bg-brand-dark text-white font-medium transition-colors"
      >
        {status === "pending" ? trans.loading : trans.submit}
      </Button>
    </form>
  );
}
