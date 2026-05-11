/**
 * Utilidades para manejar fechas en horario local del navegador.
 * Útil para inputs, filtros de fecha y valores creados desde el frontend.
 */

// ─── Base converter ───────────────────────────────────────────────────────────

function toLocalDate(localDate: string | Date): Date {
  if (localDate instanceof Date) return localDate;

  /**
   * Si viene como "2026-05-10", se interpreta como fecha local.
   * Evitamos new Date("2026-05-10") porque JS puede tratarlo como UTC.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    const [year, month, day] = localDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(localDate);
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * "18/04/2026 09:58"
 */
export function formatLocalDateTime(localDate: string | Date): string {
  const date = toLocalDate(localDate);

  return new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * "18/04/2026"
 */
export function formatLocalDate(localDate: string | Date): string {
  const date = toLocalDate(localDate);

  return new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * "09:58"
 */
export function formatLocalTime(localDate: string | Date): string {
  const date = toLocalDate(localDate);

  return new Intl.DateTimeFormat(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * "18/04 09:58" — compacto para tablas
 */
export function formatLocalDateTimeShort(localDate: string | Date): string {
  const date = toLocalDate(localDate);

  return new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Convierte una fecha local a formato input date: "2026-05-10"
 */
export function formatLocalDateInput(localDate: string | Date): string {
  const date = toLocalDate(localDate);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Devuelve la fecha local actual en formato input date: "2026-05-10"
 */
export function getTodayLocalDateInput(): string {
  return formatLocalDateInput(new Date());
}

/**
 * Devuelve el rango UTC equivalente a un día local.
 * Útil para filtros contra backend/BD que guardan fechas en UTC.
 *
 * Ejemplo:
 * "2026-05-10" en Bolivia representa:
 * startUtc: "2026-05-10T04:00:00.000Z"
 * endUtc:   "2026-05-11T03:59:59.999Z"
 */
export function getLocalDayUtcRange(localDate: string | Date): {
  startUtc: string;
  endUtc: string;
} {
  const date = toLocalDate(localDate);

  const startLocal = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );

  const endLocal = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );

  return {
    startUtc: startLocal.toISOString(),
    endUtc: endLocal.toISOString(),
  };
}

/**
 * "Hace 5m" / "Hace 2h" / "Ayer"
 */
export function formatLocalRelative(localDate: string | Date): string {
  const date = toLocalDate(localDate);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHr < 24) return `Hace ${diffHr}h`;
  if (diffDay === 1) return "Ayer";
  if (diffDay < 7) return `Hace ${diffDay} días`;

  return formatLocalDate(date);
}

// ******************************************************************
// *                                                                *
// *    Este archivo contiene funciones para formatear fechas y horas. *
// *    Convierte fechas UTC a la zona horaria local del navegador   *
// *    y las formatea según el formato especificado.              *
// *                                                                *
// ******************************************************************

/**
 * Convierte una fecha UTC a la zona horaria local del navegador
 * y la formatea según el formato especificado.
 */

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * "18/04/2026 09:58"
 */
export function formatDateTime(utcDate: string | Date): string {
  const date = toLocalDate(utcDate);
  return new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * "18/04/2026"
 */
export function formatDate(utcDate: string | Date): string {
  const date = toLocalDate(utcDate);
  return new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * "09:58"
 */
export function formatTime(utcDate: string | Date): string {
  const date = toLocalDate(utcDate);
  return new Intl.DateTimeFormat(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * "18/04 09:58" — compacto para tablas
 */
export function formatDateTimeShort(utcDate: string | Date): string {
  const date = toLocalDate(utcDate);
  return new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * "hace 5 minutos" / "hace 2 horas" / "ayer" — relativo
 */
export function formatRelative(utcDate: string | Date): string {
  const date = toLocalDate(utcDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHr < 24) return `Hace ${diffHr}h`;
  if (diffDay === 1) return "Ayer";
  if (diffDay < 7) return `Hace ${diffDay} días`;

  // Más de una semana → fecha corta
  return formatDate(date);
}

/**
 * Devuelve la zona horaria del navegador — útil para debug
 * Ej: "America/La_Paz"
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
