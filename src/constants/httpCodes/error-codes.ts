// Códigos HTTP estándar
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// errorCode que devuelve el BE en el body
export const API_ERROR_CODES = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  /** Access token vencido: renovar con el refresh token y reintentar. */
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  /** Access token inválido (firma, formato): cerrar sesión. */
  TOKEN_INVALID: "TOKEN_INVALID",
  // Errores de POST /auth/refresh: todos implican cerrar sesión.
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",
  REFRESH_TOKEN_EXPIRED: "REFRESH_TOKEN_EXPIRED",
  REFRESH_TOKEN_REVOKED: "REFRESH_TOKEN_REVOKED",
  REFRESH_TOKEN_REUSED: "REFRESH_TOKEN_REUSED",
  SESSION_NO_LONGER_VALID: "SESSION_NO_LONGER_VALID",
  /** 403: el usuario debe cambiar su contraseña temporal antes de continuar. */
  MUST_CHANGE_PASSWORD: "MUST_CHANGE_PASSWORD",

  // Recursos
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  BAD_REQUEST: "BAD_REQUEST",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",

  // Servidor
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// errorCode específicos de dominio (Inventory/Ingredients) que el FE
// traduce a un mensaje curado en vez de mostrar el mensaje crudo del BE.
export const KNOWN_ERROR_CODES = {
  LOCATION_ID_REQUIRED: "LOCATION_ID_REQUIRED",
  ALERT_WRONG_LOCATION: "ALERT_WRONG_LOCATION",
  NOT_QUANTIFIABLE: "NOT_QUANTIFIABLE",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  STOCK_NOT_FOUND: "STOCK_NOT_FOUND",
  ALERT_NOT_FOUND: "ALERT_NOT_FOUND",
} as const;

export type KnownErrorCode =
  (typeof KNOWN_ERROR_CODES)[keyof typeof KNOWN_ERROR_CODES];

export const KNOWN_ERROR_MESSAGES: Record<KnownErrorCode, string> = {
  LOCATION_ID_REQUIRED:
    "Selecciona una sucursal para continuar. Esta vista aún no soporta un modo consolidado de todas las sucursales.",
  ALERT_WRONG_LOCATION:
    "Esta alerta pertenece a otra sucursal y no puedes resolverla desde aquí.",
  NOT_QUANTIFIABLE: "Este producto no maneja control de stock.",
  INSUFFICIENT_STOCK: "No hay stock suficiente para realizar este ajuste.",
  STOCK_NOT_FOUND: "No se encontró el registro de stock.",
  ALERT_NOT_FOUND: "No se encontró la alerta.",
};
