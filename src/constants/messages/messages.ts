export const MESSAGES = {
  ERROR: {
    // Network
    OFFLINE: "Sin conexión al servidor. Verifica tu red.",
    TIMEOUT: "La solicitud tardó demasiado. Intenta de nuevo.",
    CANCELED: "La solicitud fue cancelada.",

    // Auth
    SESSION_EXPIRED: "Tu sesión expiró. Inicia sesión nuevamente.",
    UNAUTHORIZED: "No tienes permisos para realizar esta acción.",
    INVALID_CREDENTIALS: "Email o contraseña incorrectos.",

    // HTTP
    BAD_REQUEST: "Solicitud inválida. Verifica los datos enviados.",
    NOT_FOUND: "El recurso solicitado no existe.",
    CONFLICT: "Ya existe un registro con esos datos.",
    UNPROCESSABLE: "Los datos enviados no son válidos.",
    SERVER_ERROR: "Error interno del servidor. Intenta más tarde.",

    // Generic
    GENERIC: "Ocurrió un error inesperado. Intenta de nuevo.",
  },
  SUCCESS: {
    CREATED: "Registro creado exitosamente.",
    UPDATED: "Registro actualizado exitosamente.",
    DELETED: "Registro eliminado exitosamente.",
    SAVED: "Cambios guardados exitosamente.",
  },
  CONFIRM: {
    DELETE:
      "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.",
    DEACTIVATE: "¿Deseas desactivar este registro?",
    CLOSE_SHIFT: "¿Confirmas el cierre del turno actual?",
    CANCEL_SALE: "¿Deseas anular esta venta?",
  },
} as const;
