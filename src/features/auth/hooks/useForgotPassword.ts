import { usePostHandler } from "@/hooks/api.handlers";
import { httpClient, NO_TIMEOUT } from "@/services/http.client";
import { t } from "@/locales/es";
import { ApiResponse } from "@/types/api.types";
import { ForgotPasswordRequestDTO } from "../dto/login.dto";

/**
 * POST /auth/forgot-password: el backend envía una contraseña temporal
 * (válida 30 min) al correo de la cuenta.
 *
 * Responde siempre igual exista o no la cuenta, así que devolvemos su
 * `message` tal cual. El 429 (demasiados intentos) lo muestra el interceptor.
 */
export function useForgotPassword() {
  return usePostHandler({
    mutationFn: (identifier: string) =>
      httpClient
        .post<ApiResponse<null>>(
          "/auth/forgot-password",
          { identifier: identifier.trim() } satisfies ForgotPasswordRequestDTO,
          NO_TIMEOUT,
        )
        .then((r) => r.data?.message || t.auth.forgotPassword.sent),
    retry: false,
  });
}
