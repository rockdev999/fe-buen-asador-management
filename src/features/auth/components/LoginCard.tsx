import { t } from "@/locales/es";
import { useLogin } from "../hooks/useLogin";
import { LoginForm } from "../forms/login.form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/Basics/FormField";
import { PasswordField } from "@/components/shared/Interactives/PasswordField";
import { useFormik } from "formik";
import { loginFormConfig } from "../forms/login.form-config";
import { Input } from "@/components/ui/input";
import { Error } from "@/components/shared/Basics/Error";
import { AppLabel } from "@/components/shared/Basics/AppLabel";

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
      <FormField>
        <AppLabel required>{trans.email}</AppLabel>
        <Input
          id="email"
          name="email"
          value={formValues.email}
          placeholder={trans.emailPlaceholder}
          type="email"
          autoComplete="email"
          onBlur={formHandlerBlur}
          onChange={formHandleChange}
        />
        <Error touched={formTouched.email} error={formErrors.email} />
      </FormField>
      <FormField>
        <AppLabel required>{trans.password}</AppLabel>
        <PasswordField
          id="password"
          name="password"
          placeholder={trans.passwordPlaceholder}
          autoComplete="current-password"
          value={formValues.password}
          onChange={formHandleChange}
          onBlur={formHandlerBlur}
        />
        <Error touched={formTouched.password} error={formErrors.password} />
      </FormField>

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
