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

// errorCode específicos de dominio (Inventory/Ingredients/Turnos) que el FE
// traduce a un mensaje curado en vez de mostrar el mensaje crudo del BE.
export const KNOWN_ERROR_CODES = {
  LOCATION_ID_REQUIRED: "LOCATION_ID_REQUIRED",
  ALERT_WRONG_LOCATION: "ALERT_WRONG_LOCATION",
  NOT_QUANTIFIABLE: "NOT_QUANTIFIABLE",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  STOCK_NOT_FOUND: "STOCK_NOT_FOUND",
  ALERT_NOT_FOUND: "ALERT_NOT_FOUND",

  // Turnos de caja
  NO_ACTIVE_SHIFT: "NO_ACTIVE_SHIFT",
  SHIFT_ALREADY_OPEN: "SHIFT_ALREADY_OPEN",
  SHIFT_HAS_PENDING_ORDERS: "SHIFT_HAS_PENDING_ORDERS",
  SHIFT_STILL_OPEN: "SHIFT_STILL_OPEN",
  SHIFT_NOT_OWNED: "SHIFT_NOT_OWNED",
  SHIFT_CLOSED: "SHIFT_CLOSED",
  SHIFT_NOTES_REQUIRED: "SHIFT_NOTES_REQUIRED",
  SHIFT_NOT_PENDING: "SHIFT_NOT_PENDING",
  SHIFT_REVIEW_NOTES_REQUIRED: "SHIFT_REVIEW_NOTES_REQUIRED",
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

  NO_ACTIVE_SHIFT: "No tienes un turno de caja abierto.",
  SHIFT_ALREADY_OPEN: "Ya existe un turno abierto en esta sucursal.",
  SHIFT_HAS_PENDING_ORDERS:
    "Hay pedidos sin cobrar ni cancelar. Resuélvelos antes de cerrar el turno.",
  SHIFT_STILL_OPEN: "Cierra tu turno de caja antes de cambiar de sucursal.",
  SHIFT_NOT_OWNED: "Este turno lo abrió otro cajero.",
  SHIFT_CLOSED: "No se puede anular: el turno de esta venta ya fue cerrado.",
  SHIFT_NOTES_REQUIRED:
    "El monto no coincide con el esperado. Explica la diferencia.",
  SHIFT_NOT_PENDING: "Este cierre no está pendiente de aprobación.",
  SHIFT_REVIEW_NOTES_REQUIRED:
    "El cierre tiene diferencia. Deja un comentario para aprobarlo.",
};
