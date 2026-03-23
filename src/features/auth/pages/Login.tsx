import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";
import { useEffect } from "react";
import { PATHS } from "@/routes";
import { useForm } from "react-hook-form";
import { t } from "@/locales/es";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/FormField";
import { PasswordField } from "@/components/shared/PasswordField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldErrors } from "@/hooks/useFieldErrors";
import { LoginForm } from "../forms/login.form";
import { loginSchema } from "../validators/login.schema";

const trans = t.auth.login;

export const Login = () => {
  const navigate = useNavigate();

  const { isAuthenticated, isTempAuth } = useAuth();
  const { mutate: login, status, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useFieldErrors(error, setError);

  useEffect(() => {
    if (isAuthenticated) navigate(PATHS.DASHBOARD, { replace: true });
    if (isTempAuth) navigate(PATHS.SELECT_LOCATION, { replace: true });
  }, [isAuthenticated, isTempAuth, navigate]);

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-inkblack flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">BA</span>
          </div>
          <span className="text-white text-base font-medium">Buen Asador</span>
        </div>

        <div>
          <h1 className="text-white text-3xl font-medium leading-snug mb-3">
            {trans.brand.tagline.split("confianza.")[0]}
            <span className="text-brand">confianza.</span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            {trans.brand.description}
          </p>
        </div>

        <div className="flex gap-1.5">
          <div className="w-5 h-1.5 bg-brand rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-medium">BA</span>
            </div>
            <span className="text-dark text-sm font-medium">Buen Asador</span>
          </div>

          <div className="bg-white rounded-2xl border border-surface p-8">
            <h2 className="text-xl font-medium text-dark mb-1">
              {trans.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-7">
              {trans.subtitle}
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-1"
            >
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

              <div className="text-right -mt-1 mb-2">
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
          </div>
        </div>
      </div>
    </div>
  );
};
