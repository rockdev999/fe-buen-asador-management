import { t } from "@/locales/es";
import { useLogin } from "../../hooks/useLogin";
import { LoginForm } from "../../forms/login.form";
import { useFormik } from "formik";
import { loginFormConfig } from "../../forms/login.form-config";
import { FormInput } from "@/components/shared/Form/FormInput";
import { FormPassword } from "@/components/shared/Form/FormPassword";
import { Button } from "@/components/shared/Basics/Button";

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
      <FormInput
        required
        id="email"
        name="email"
        label={trans.email}
        type="email"
        autoComplete="email"
        value={formValues.email}
        placeholder={trans.emailPlaceholder}
        onBlur={formHandlerBlur}
        onChange={formHandleChange}
        touched={formTouched.email}
        error={formErrors.email}
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
        <Button type="button" variant="link" size="xs">
          {trans.forgotPassword}
        </Button>
      </div>
      <Button type="submit" isLoading={status === "pending"} className="w-full">
        {trans.submit}
      </Button>
    </form>
  );
}
