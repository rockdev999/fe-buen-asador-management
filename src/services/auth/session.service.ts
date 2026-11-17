/**
 * Renovación y cierre de sesión, fuera de React.
 *
 * - `refreshSession()`: renueva el access token con el refresh token.
 *   Una sola petición a la vez (promesa compartida), sobre una instancia de
 *   axios SIN interceptores, para que un 401 del propio refresh no vuelva a
 *   entrar al interceptor de errores.
 * - `logoutSession()`: avisa al backend (sin esperar), limpia store y caché y
 *   lleva al login.
 */
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { appConfig } from "@/config/app.config";
import { env } from "@/config/env";
import { MESSAGES } from "@/constants";
import {
  LogoutRequestDTO,
  RefreshSessionRequestDTO,
  SessionResponseDTO,
} from "@/features/auth/dto/login.dto";
import { mapSessionDTOToModel } from "@/features/auth/mappers/login.mapper";
import { queryClient } from "@/lib/query-client";
import { PATHS } from "@/routes/paths";
import { useAuthStore } from "@/stores/auth.store";
import { ApiErrorResponse } from "@/types/api.types";

/** Cliente sin interceptores: solo para /auth/refresh y /auth/logout. */
const authClient = axios.create({
  baseURL: env.API_URL,
  timeout: appConfig.http.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * La sesión terminó y ya se hizo el logout (con su toast). Quien la recibe no
 * debe mostrar otro error.
 */
export class SessionEndedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionEndedError";
  }
}

let inFlight: Promise<string> | null = null;

/**
 * Renueva la sesión y devuelve el nuevo access token.
 *
 * @param staleToken access token con el que falló la petición. Si al releer el
 *   estado persistido ya hay otro distinto, otra pestaña renovó primero y se
 *   reutiliza ese en lugar de gastar (y rotar) el refresh token otra vez.
 *
 * Rechaza con `SessionEndedError` si el backend rechaza el refresh (401): en
 * ese caso ya cerró la sesión. Ante errores de red rechaza sin cerrar sesión.
 */
export function refreshSession(staleToken?: string | null): Promise<string> {
  if (!inFlight) {
    inFlight = doRefresh(staleToken).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doRefresh(staleToken?: string | null): Promise<string> {
  // Otra pestaña pudo haber rotado los tokens: leer lo último persistido.
  await useAuthStore.persist.rehydrate();
  const { token, refreshToken } = useAuthStore.getState();

  if (token && staleToken && token !== staleToken) return token;

  if (!refreshToken) {
    const message = MESSAGES.ERROR.SESSION_EXPIRED;
    endSession({ message, notifyBackend: false });
    throw new SessionEndedError(message);
  }

  try {
    const { data } = await authClient.post<SessionResponseDTO>(
      "/auth/refresh",
      { refreshToken } satisfies RefreshSessionRequestDTO,
    );
    useAuthStore.getState().setSession(mapSessionDTOToModel(data));
    return data.accessToken;
  } catch (error) {
    const response = (error as AxiosError<ApiErrorResponse>).response;
    if (response?.status === 401) {
      // REFRESH_TOKEN_INVALID / _EXPIRED / _REVOKED / _REUSED o
      // SESSION_NO_LONGER_VALID: no hay forma de recuperar la sesión.
      const message = response.data?.message || MESSAGES.ERROR.SESSION_EXPIRED;
      endSession({ message, notifyBackend: false });
      throw new SessionEndedError(message);
    }
    // Red caída, timeout o 5xx: la sesión puede seguir siendo válida.
    throw error;
  }
}

interface LogoutOptions {
  /** Si se define, se muestra como toast de error. */
  message?: string;
  /**
   * Revocar el refresh token en el backend. Se omite cuando el backend ya lo
   * rechazó (refresh fallido): llamarlo sería una petición inútil.
   */
  notifyBackend?: boolean;
}

/** Cierra la sesión: backend (sin esperar), store, caché y navegación a login. */
export function logoutSession(options: LogoutOptions = {}) {
  endSession({ notifyBackend: true, ...options });
}

/**
 * El backend exige cambiar la contraseña temporal (403 MUST_CHANGE_PASSWORD):
 * se marca en el store y se lleva a la pantalla de cambio. Las rutas del
 * layout también redirigen ahí mientras `mustChangePassword` siga en true.
 */
export function requirePasswordChange() {
  useAuthStore.getState().setMustChangePassword(true);
  navigateTo(PATHS.CHANGE_PASSWORD);
}

/**
 * El backend respondió TOKEN_TEMPORARY: la sesión solo tiene el token
 * temporal del login. Si sigue guardado, se vuelve al login para que la
 * tarjeta de sucursales termine el ingreso; si no, se cierra sesión.
 */
export function requireLocationSelection() {
  if (useAuthStore.getState().tempToken) navigateTo(PATHS.LOGIN);
  else endSession({ notifyBackend: false });
}

// Import dinámico para no crear un ciclo services → routes → páginas → services.
function navigateTo(path: string) {
  if (window.location.pathname.startsWith(path)) return;
  void import("@/routes/Router").then(({ router }) =>
    router.navigate(path, { replace: true }),
  );
}

function endSession({ message, notifyBackend = true }: LogoutOptions) {
  const { refreshToken } = useAuthStore.getState();

  if (notifyBackend && refreshToken) {
    // Responde 204 siempre; no se espera la respuesta y se ignoran errores.
    authClient
      .post("/auth/logout", { refreshToken } satisfies LogoutRequestDTO)
      .catch(() => undefined);
  }

  useAuthStore.getState().logout();
  queryClient.clear();

  if (message) toast.error(message, { id: "session-ended" });

  navigateTo(PATHS.LOGIN);
}
