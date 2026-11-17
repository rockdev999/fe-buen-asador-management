/**
 * Lógica pura del manejo de errores HTTP: clasificar el fallo y elegir el
 * mensaje. Sin toasts ni navegación, para poder probarla aislada.
 */
import axios, { type AxiosError } from "axios";
import { API_ERROR_CODES, KNOWN_ERROR_MESSAGES, MESSAGES } from "@/constants";
import type { ApiErrorResponse } from "@/types/api.types";

export type ErrorKind =
  /** Abortado a propósito (React Query, AbortController): no es un error. */
  | "canceled"
  /** El cliente cortó por tiempo; el servidor pudo haber procesado la petición. */
  | "timeout"
  /** Sin respuesta: sin internet, backend apagado, CORS, DNS... */
  | "network"
  /** 502/503/504: un proxy respondió, pero el backend no está disponible. */
  | "unavailable"
  /** Respuesta HTTP normal del backend. */
  | "http";

const GATEWAY_STATUSES = new Set([502, 503, 504]);

export function isGatewayStatus(status: number | undefined): boolean {
  return status !== undefined && GATEWAY_STATUSES.has(status);
}

export function classifyError(error: AxiosError): ErrorKind {
  if (axios.isCancel(error) || error.code === "ERR_CANCELED") return "canceled";
  if (!error.response) {
    return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
      ? "timeout"
      : "network";
  }
  return isGatewayStatus(error.response.status) ? "unavailable" : "http";
}

const IDEMPOTENT_METHODS = new Set(["get", "head", "options"]);

/** Repetir la petición no cambia nada en el servidor (solo lecturas). */
export function isIdempotent(method: string | undefined): boolean {
  return IDEMPOTENT_METHODS.has((method ?? "get").toLowerCase());
}

/**
 * Lee el cuerpo de error sin confiar en su forma: un proxy puede devolver
 * HTML, texto plano o nada.
 */
export function parseErrorBody(data: unknown): {
  errorCode?: string;
  message?: string;
  errors: ApiErrorResponse["errors"];
} {
  if (!data || typeof data !== "object") return { errors: [] };
  const body = data as Record<string, unknown>;

  const errorCode =
    typeof body.errorCode === "string" && body.errorCode
      ? body.errorCode
      : undefined;

  // Por contrato es un string, pero se toleran arreglos (validaciones antiguas).
  let message: string | undefined;
  if (typeof body.message === "string") message = body.message.trim();
  else if (Array.isArray(body.message)) {
    message = body.message.filter((m) => typeof m === "string").join(". ");
  }

  const errors = Array.isArray(body.errors)
    ? body.errors.filter(
        (e): e is { field: string; message: string } =>
          !!e &&
          typeof e === "object" &&
          typeof (e as { field?: unknown }).field === "string" &&
          typeof (e as { message?: unknown }).message === "string",
      )
    : [];

  return { errorCode, message: message || undefined, errors };
}

function statusFallback(status: number): string {
  switch (status) {
    case 400:
      return MESSAGES.ERROR.BAD_REQUEST;
    case 401:
      return MESSAGES.ERROR.SESSION_EXPIRED;
    case 403:
      return MESSAGES.ERROR.UNAUTHORIZED;
    case 404:
      return MESSAGES.ERROR.NOT_FOUND;
    case 409:
      return MESSAGES.ERROR.CONFLICT;
    case 413:
      return MESSAGES.ERROR.PAYLOAD_TOO_LARGE;
    case 422:
      return MESSAGES.ERROR.UNPROCESSABLE;
    case 429:
      return MESSAGES.ERROR.TOO_MANY_REQUESTS;
    default:
      if (isGatewayStatus(status)) return MESSAGES.ERROR.SERVER_UNAVAILABLE;
      if (status >= 500) return MESSAGES.ERROR.SERVER_ERROR;
      return MESSAGES.ERROR.GENERIC;
  }
}

interface ResolveInput {
  kind: ErrorKind;
  status?: number;
  method?: string;
  errorCode?: string;
  message?: string;
  /** `navigator.onLine`: distingue "sin internet" de "servidor caído". */
  browserOnline?: boolean;
}

/**
 * Mensaje a mostrar. El `message` del backend tiene prioridad: por contrato
 * está en español y nunca trae detalles técnicos. Los textos del FE solo
 * cubren respuestas sin mensaje (proxies, errores de red).
 */
export function resolveErrorMessage({
  kind,
  status,
  method,
  errorCode,
  message,
  browserOnline = true,
}: ResolveInput): string {
  switch (kind) {
    case "canceled":
      return MESSAGES.ERROR.CANCELED;
    case "timeout":
      // En una escritura, el servidor pudo haberla completado.
      return isIdempotent(method)
        ? MESSAGES.ERROR.TIMEOUT
        : MESSAGES.ERROR.TIMEOUT_MUTATION;
    case "network":
      return browserOnline
        ? MESSAGES.ERROR.SERVER_UNREACHABLE
        : MESSAGES.ERROR.OFFLINE;
    case "unavailable":
      return MESSAGES.ERROR.SERVER_UNAVAILABLE;
  }

  if (message) return message;
  if (errorCode && errorCode in KNOWN_ERROR_MESSAGES) {
    return KNOWN_ERROR_MESSAGES[errorCode as keyof typeof KNOWN_ERROR_MESSAGES];
  }
  if (errorCode === API_ERROR_CODES.VALIDATION_ERROR) {
    return MESSAGES.ERROR.VALIDATION;
  }
  return status ? statusFallback(status) : MESSAGES.ERROR.GENERIC;
}
