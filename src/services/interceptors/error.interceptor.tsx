import { API_ERROR_CODES, HTTP_STATUS, MESSAGES } from "@/constants";
import {
  logoutSession,
  refreshSession,
  requireLocationSelection,
  requirePasswordChange,
  SessionEndedError,
} from "@/services/auth/session.service";
import { useAuthStore } from "@/stores/auth.store";
import { ApiErrorResponse } from "@/types/api.types";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import {
  markOffline,
  markOnline,
  useOfflineStore,
} from "@/features/offline/stores/offline.store";
import {
  summarizeFieldErrors,
  validationToastDuration,
} from "@/utils/validation-errors";
import {
  classifyError,
  isIdempotent,
  parseErrorBody,
  resolveErrorMessage,
} from "./error-message";

interface RetriableConfig extends InternalAxiosRequestConfig {
  /** Ya se renovó el token y se reintentó una vez esta petición. */
  _retry?: boolean;
}

/** Error que reciben los `catch` / `onError` de quien hizo la petición. */
export interface RejectedApiError {
  message: string;
  fields: ApiErrorResponse["errors"];
  status?: number;
  errorCode?: string;
  /**
   * Sin respuesta útil del backend y la petición seguro no se procesó (o es
   * una lectura): se puede usar la copia offline o el cobro offline.
   */
  networkError: boolean;
  /** Se abortó a propósito; quien la hizo no debe mostrar nada. */
  canceled?: boolean;
  /** Escritura cortada por tiempo: pudo haberse procesado en el servidor. */
  timedOut?: boolean;
}

/** Endpoints donde un 401 nunca debe disparar un refresh. */
const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

/** Pantallas donde un 401 es un error de credenciales, no una sesión vencida. */
const PUBLIC_PATHS = ["/login", "/select-location"];

function isPublicPath(): boolean {
  return PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));
}

function reject(error: Partial<RejectedApiError> & { message: string }) {
  return Promise.reject({
    fields: [],
    networkError: false,
    ...error,
  } satisfies RejectedApiError);
}

/**
 * Un aviso por pérdida de conexión: luego el indicador fijo del POS muestra
 * el estado y no se repite el toast en cada petición.
 */
function notifyOffline(message: string, silent?: boolean) {
  const wasOffline = useOfflineStore.getState().isOffline;
  markOffline();
  if (!silent && !wasOffline) toast.error(message, { id: "network-offline" });
}

async function blobToJson(blob: Blob): Promise<unknown> {
  try {
    return JSON.parse(await blob.text());
  } catch {
    return undefined;
  }
}

export async function errorInterceptor(
  error: unknown,
  instance: AxiosInstance,
) {
  // Algo que no es de axios (p. ej. un throw en un interceptor de request).
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    console.error(error);
    toast.error(MESSAGES.ERROR.GENERIC, { id: "unexpected-error" });
    return reject({ message: MESSAGES.ERROR.GENERIC });
  }

  // Descargas (responseType 'blob'): el error JSON del backend llega como
  // Blob. Se decodifica para que el refresh del token y el toast con el
  // mensaje del backend funcionen igual que en el resto de peticiones.
  if (error.response && error.response.data instanceof Blob) {
    // parseErrorBody tolera cualquier forma (o undefined si no era JSON).
    error.response.data = (await blobToJson(error.response.data)) as ApiErrorResponse;
  }

  const config = error.config as RetriableConfig | undefined;
  const silent = !!config?.silentErrors;
  const method = config?.method;
  const kind = classifyError(error);
  const status = error.response?.status;
  const {
    errorCode,
    message: beMessage,
    errors: fields,
  } = parseErrorBody(error.response?.data);
  const message = resolveErrorMessage({
    kind,
    status,
    method,
    errorCode,
    message: beMessage,
    browserOnline: navigator.onLine,
  });

  switch (kind) {
    // ── Cancelada a propósito: no es un error para el usuario ─────────────
    case "canceled":
      return reject({ message, canceled: true });

    // ── Timeout: el servidor está lento, no necesariamente caído ──────────
    case "timeout": {
      if (isIdempotent(method)) {
        // Una lectura se puede servir desde la copia offline.
        if (!silent) toast.error(message, { id: "request-timeout" });
        return reject({ message, networkError: true });
      }
      // Una escritura pudo haberse completado: no se ofrece reintentar ni
      // cobrar offline, para no duplicarla.
      if (!silent)
        toast.warning(message, { id: "mutation-timeout", duration: 10_000 });
      return reject({ message, timedOut: true });
    }

    // ── Sin respuesta: el POS pasa a modo offline ─────────────────────────
    case "network":
      notifyOffline(message, silent);
      return reject({ message, networkError: true });

    // ── 502/503/504: el proxy responde pero el backend no ─────────────────
    case "unavailable":
      notifyOffline(message, silent);
      // Un 504 en una escritura pudo procesarse: solo las lecturas usan la
      // copia offline.
      return reject({ message, status, networkError: isIdempotent(method) });
  }

  // ── Respuesta normal del backend ──────────────────────────────────────
  markOnline();

  // Access token vencido: renovar y reintentar una sola vez, en silencio.
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
        return reject({ message: refreshError.message, status, errorCode });
      }
      // Error de red al renovar: no se cierra sesión, solo falla esta petición.
      notifyOffline(MESSAGES.ERROR.SERVER_UNREACHABLE, silent);
      return reject({
        message: MESSAGES.ERROR.SERVER_UNREACHABLE,
        status,
        errorCode,
        networkError: true,
      });
    }
  }

  const rejection = { message, status, errorCode, fields };

  // Contraseña temporal pendiente: redirigir sin toast.
  if (errorCode === API_ERROR_CODES.MUST_CHANGE_PASSWORD) {
    requirePasswordChange();
    return reject(rejection);
  }

  if (status === HTTP_STATUS.UNAUTHORIZED && !isPublicPath()) {
    // Solo hay token temporal: falta elegir sucursal, no se cierra sesión.
    if (errorCode === API_ERROR_CODES.TOKEN_TEMPORARY) {
      requireLocationSelection();
      toast.warning(message, { id: "session-ended" });
      return reject(rejection);
    }
    // TOKEN_INVALID, REFRESH_TOKEN_*, SESSION_NO_LONGER_VALID, o el reintento
    // tras renovar volvió a fallar. El toast lo muestra el logout (id fijo:
    // varias peticiones fallando a la vez dan un solo aviso).
    logoutSession({ message });
    return reject(rejection);
  }

  if (silent) return reject(rejection);

  // Validación con detalle por campo: un único toast con la lista. El id fijo
  // hace que un nuevo envío reemplace el aviso anterior en vez de apilarse.
  // Con otro errorCode (p. ej. SHIFT_REVIEW_NOTES_REQUIRED trae errors[notes])
  // se muestra su `message`, que ya explica qué falta.
  if (
    fields.length > 0 &&
    (!errorCode || errorCode === API_ERROR_CODES.VALIDATION_ERROR)
  ) {
    const lines = summarizeFieldErrors(fields);
    toast.error(MESSAGES.ERROR.VALIDATION, {
      id: "validation-error",
      description: (
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ),
      duration: validationToastDuration(lines.length),
    });
    return reject(rejection);
  }

  // El mismo error repetido (doble clic, varias peticiones fallando a la vez)
  // se muestra una sola vez.
  const id = `api-error:${errorCode ?? status}:${message}`;

  if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
    toast.warning(message, { id: "rate-limit" });
  } else if (
    status === HTTP_STATUS.FORBIDDEN ||
    status === HTTP_STATUS.NOT_FOUND
  ) {
    toast.warning(message, { id });
  } else {
    toast.error(message, { id });
  }

  return reject(rejection);
}
