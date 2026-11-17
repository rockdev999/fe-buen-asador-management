import { useNavigate } from "react-router-dom";
import { usePostHandler } from "@/hooks/api.handlers";
import { httpClient, NO_TIMEOUT } from "@/services/http.client";
import { useAuthStore } from "@/stores/auth.store";
import { getHomePath } from "@/routes/home-path";
import { t } from "@/locales/es";
import { ChangePasswordRequestDTO } from "../dto/login.dto";
import { ChangePasswordForm } from "../validators/change-password.schema";

export function useChangePassword() {
  const navigate = useNavigate();

  return usePostHandler({
    // 204 sin cuerpo. Los 400 (contraseña actual incorrecta, igual a la
    // actual, errores por campo) los muestra el interceptor.
    mutationFn: (form: ChangePasswordForm) =>
      httpClient
        .post<void>(
          "/users/change-password",
          {
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          } satisfies ChangePasswordRequestDTO,
          NO_TIMEOUT,
        )
        .then(() => undefined),
    retry: false,
    successMessage: t.auth.changePassword.success,
    onSuccessCallback: () => {
      // La sesión sigue activa y el token actual sirve: el backend desbloquea
      // al usuario en la siguiente petición.
      const { setMustChangePassword, user } = useAuthStore.getState();
      setMustChangePassword(false);
      navigate(getHomePath(user?.role), { replace: true });
    },
  });
}
