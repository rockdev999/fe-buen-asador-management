import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { CredentialsEmailStatusEnum } from "@/constants/enums/user.enum";
import { usePostHandler } from "@/hooks/api.handlers";
import { httpClient, NO_TIMEOUT } from "@/services/http.client";
import { ApiResponse } from "@/types/api.types";
import { ResetPasswordResponseDTO, UserLocationsDTO } from "../dto/user.dto";

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 30_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Restablece la contraseña de un usuario (POST /users/:id/reset-password) y
 * sigue el envío del correo con la contraseña temporal.
 *
 * Tras el 200 consulta GET /users/:id cada 2 s hasta que el estado deje de
 * ser PENDING (o 30 s) y luego invalida el listado. Mientras tanto expone el
 * estado en `statusOverrides` para que la tabla lo muestre al instante.
 */
export function usePasswordReset() {
  const queryClient = useQueryClient();
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, CredentialsEmailStatusEnum>
  >({});

  // Por usuario, el número de la última ronda de seguimiento: un reintento
  // invalida la ronda anterior para que no pise el estado nuevo.
  const runsRef = useRef(new Map<string, number>());
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const setOverride = (userId: string, status: CredentialsEmailStatusEnum) =>
    setStatusOverrides((prev) => ({ ...prev, [userId]: status }));

  const clearOverride = (userId: string) =>
    setStatusOverrides((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });

  const trackEmail = useCallback(
    async (userId: string) => {
      const run = (runsRef.current.get(userId) ?? 0) + 1;
      runsRef.current.set(userId, run);
      const isSuperseded = () => runsRef.current.get(userId) !== run;
      const refreshList = () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });

      setOverride(userId, CredentialsEmailStatusEnum.PENDING);

      const deadline = Date.now() + POLL_TIMEOUT_MS;
      while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL_MS);
        if (isSuperseded()) return;
        if (unmountedRef.current) {
          // Se salió de la página: el listado se pedirá fresco al volver.
          void refreshList();
          return;
        }

        try {
          const user = await httpClient
            .get<ApiResponse<UserLocationsDTO>>(`/users/${userId}`)
            .then((r) => r.data.data!);
          if (isSuperseded()) return;

          const status = user.credentialsEmailStatus;
          if (status && status !== CredentialsEmailStatusEnum.PENDING) {
            if (!unmountedRef.current) setOverride(userId, status);
            break;
          }
        } catch {
          break; // El interceptor ya mostró el error.
        }
      }

      await refreshList();
      // El listado ya trae el estado real: se deja de sobrescribir.
      if (!isSuperseded() && !unmountedRef.current) clearOverride(userId);
    },
    [queryClient],
  );

  const mutation = usePostHandler({
    mutationFn: (userId: string) =>
      httpClient
        .post<ApiResponse<ResetPasswordResponseDTO>>(
          `/users/${userId}/reset-password`,
          undefined,
          NO_TIMEOUT,
        )
        .then((r) => r.data.data!),
    retry: false,
    successMessage:
      "Contraseña restablecida. La contraseña temporal se está enviando al correo del usuario",
    onSuccessCallback: (data) => {
      void trackEmail(data.userId);
    },
  });

  return {
    /** Cada llamada genera una contraseña temporal nueva; la anterior deja de servir. */
    resetPassword: mutation.mutate,
    /** Usuario cuyo restablecimiento está en curso, o null. */
    resettingUserId: mutation.isPending ? (mutation.variables ?? null) : null,
    statusOverrides,
  };
}
