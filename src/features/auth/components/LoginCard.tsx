import { t } from "@/locales/es";
import { useLogin } from "../hooks/useLogin";
import { useForm } from "react-hook-form";
import { LoginForm } from "../forms/login.form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validators/login.schema";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { FormField } from "@/components/shared/FormField";
import { PasswordField } from "@/components/shared/PasswordField";
import { Button } from "@/components/ui/button";

const trans = t.auth.login;

export function LoginCard() {
  const { mutate: login, status, error } = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useFieldErrors(error, setError);

  function onSubmit(data: LoginForm) {
    login(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
        type="email"
        label={trans.email}
        placeholder={trans.emailPlaceholder}
        autoComplete="email"
        error={errors.email?.message}
        required
        {...register("email")}
      />

      <PasswordField
        id="password"
        label={trans.password}
        placeholder={trans.passwordPlaceholder}
        autoComplete="current-password"
        error={errors.password?.message}
        required
        {...register("password")}
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
