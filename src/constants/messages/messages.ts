export const MESSAGES = {
  ERROR: {
    // Network
    OFFLINE: "Sin conexión a internet. Verifica tu red.",
    SERVER_UNREACHABLE:
      "No se pudo conectar con el servidor. Intenta de nuevo en unos momentos.",
    SERVER_UNAVAILABLE:
      "El servidor no está disponible en este momento. Intenta en unos minutos.",
    TIMEOUT: "La solicitud tardó demasiado. Intenta de nuevo.",
    TIMEOUT_MUTATION:
      "El servidor tardó demasiado en responder. La operación pudo haberse completado: verifica antes de volver a intentarlo.",
    CANCELED: "La solicitud fue cancelada.",

    // Validación
    VALIDATION: "Revisa los datos ingresados",

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
    PAYLOAD_TOO_LARGE: "El archivo o los datos enviados son demasiado grandes.",
    TOO_MANY_REQUESTS:
      "Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.",

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
