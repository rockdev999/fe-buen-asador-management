import {
  API_ERROR_CODES,
  HTTP_STATUS,
  KNOWN_ERROR_CODES,
  KNOWN_ERROR_MESSAGES,
  MESSAGES,
} from "@/constants";
import { KnownErrorCode } from "@/constants/httpCodes/error-codes";
import {
  logoutSession,
  refreshSession,
  requirePasswordChange,
  SessionEndedError,
} from "@/services/auth/session.service";
import { useAuthStore } from "@/stores/auth.store";
import { ApiErrorResponse } from "@/types/api.types";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

interface RetriableConfig extends InternalAxiosRequestConfig {
  /** Ya se renovó el token y se reintentó una vez esta petición. */
  _retry?: boolean;
}

/** Endpoints donde un 401 nunca debe disparar un refresh. */
const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

function isKnownErrorCode(code: string | undefined): code is KnownErrorCode {
  return !!code && code in KNOWN_ERROR_MESSAGES;
}

// errorCodes conocidos cuyo `message` del backend es más preciso que el texto
// curado: SHIFT_CLOSED dice si es una anulación o un egreso;
// SHIFT_HAS_PENDING_ORDERS indica cuántos pedidos faltan.
const PREFER_BACKEND_MESSAGE = new Set<string>([
  KNOWN_ERROR_CODES.SHIFT_CLOSED,
  KNOWN_ERROR_CODES.SHIFT_HAS_PENDING_ORDERS,
]);

function backendMessageText(message: unknown): string | undefined {
  if (Array.isArray(message)) return message.filter(Boolean).join(". ");
  return typeof message === "string" && message ? message : undefined;
}

function getErrorMessage(error: AxiosError<ApiErrorResponse>): string {
  const status = error.response?.status;
  const errorCode = error.response?.data?.errorCode;
  const beMessage = error.response?.data?.message;

  if (!error.response) {
    if (axios.isCancel(error)) return MESSAGES.ERROR.CANCELED;
    if (error.code === "ECONNABORTED") return MESSAGES.ERROR.TIMEOUT;
    return MESSAGES.ERROR.OFFLINE;
  }

  if (isKnownErrorCode(errorCode)) {
    const fromBackend = backendMessageText(beMessage);
    if (PREFER_BACKEND_MESSAGE.has(errorCode) && fromBackend) return fromBackend;
    return KNOWN_ERROR_MESSAGES[errorCode];
  }

  if (beMessage) return beMessage;

  switch (status) {
    case HTTP_STATUS.FORBIDDEN:
      return MESSAGES.ERROR.UNAUTHORIZED;
    case HTTP_STATUS.NOT_FOUND:
      return beMessage ?? MESSAGES.ERROR.NOT_FOUND;
    case HTTP_STATUS.CONFLICT:
      return beMessage ?? MESSAGES.ERROR.CONFLICT;
    case HTTP_STATUS.BAD_REQUEST:
      return beMessage ?? MESSAGES.ERROR.BAD_REQUEST;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return beMessage ?? MESSAGES.ERROR.UNPROCESSABLE;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return MESSAGES.ERROR.SERVER_ERROR;
    default:
      return beMessage ?? MESSAGES.ERROR.GENERIC;
  }
}

const PUBLIC_PATHS = ["/login", "/select-location"];

function isPublicPath(): boolean {
  return PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));
}

function toRejection(
  message: string,
  status?: number,
  errorCode?: string,
  fields: ApiErrorResponse["errors"] = [],
) {
  return Promise.reject({ message, fields, status, errorCode });
}

export async function errorInterceptor(
  error: AxiosError<ApiErrorResponse>,
  instance: AxiosInstance,
) {
  const status = error.response?.status;
  const errorCode = error.response?.data?.errorCode;
  const fields = error.response?.data?.errors ?? [];
  const config = error.config as RetriableConfig | undefined;

  // ── Access token vencido: renovar y reintentar en silencio ──────────────
  if (
    config &&
    status === HTTP_STATUS.UNAUTHORIZED &&
    errorCode === API_ERROR_CODES.TOKEN_EXPIRED &&
    !config._retry &&
    useAuthStore.getState().refreshToken &&
    !AUTH_PATHS.some((p) => config.url?.includes(p))
  ) {
    config._retry = true;
    const staleToken = String(config.headers.Authorization ?? "").replace(
      /^Bearer\s+/i,
      "",
    );
    try {
      const newToken = await refreshSession(staleToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      return instance(config);
    } catch (refreshError) {
      // Refresh rechazado: refreshSession ya cerró sesión y mostró el motivo.
      if (refreshError instanceof SessionEndedError) {
        return toRejection(refreshError.message, status, errorCode);
      }
      // Error de red al renovar: no se cierra sesión, solo falla esta petición.
      toast.error(MESSAGES.ERROR.OFFLINE, { id: "refresh-offline" });
      return toRejection(MESSAGES.ERROR.OFFLINE, status, errorCode);
    }
  }

  const message = getErrorMessage(error);

  // ── Contraseña temporal pendiente: redirigir sin toast ──────────────────
  if (
    status === HTTP_STATUS.FORBIDDEN &&
    errorCode === API_ERROR_CODES.MUST_CHANGE_PASSWORD
  ) {
    requirePasswordChange();
    return toRejection(message, status, errorCode);
  }

  const isUnauthorized =
    status === HTTP_STATUS.UNAUTHORIZED ||
    errorCode === API_ERROR_CODES.UNAUTHORIZED;

  // 401 que no se resuelve renovando: TOKEN_INVALID, sin refresh token
  // guardado, o el reintento tras renovar volvió a fallar.
  if (isUnauthorized && !isPublicPath()) {
    logoutSession();
  }

  // Un errorCode conocido ya trae un mensaje curado: se muestra ese en vez de
  // un toast por campo (p. ej. SHIFT_REVIEW_NOTES_REQUIRED llega con errors[notes]).
  const hasFieldErrors = fields.length > 0 && !isKnownErrorCode(errorCode);

  if (hasFieldErrors) {
    fields.forEach(({ field, message: fieldMessage }) => {
      toast.error(`${field}: ${fieldMessage}`);
    });
  } else {
    const isWarning =
      status === HTTP_STATUS.FORBIDDEN || status === HTTP_STATUS.NOT_FOUND;

    if (isWarning) toast.warning(message);
    else toast.error(message);
  }

  return toRejection(message, status, errorCode, fields);
}
