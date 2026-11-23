/** Cantidad de decimales permitida por defecto en todo el sistema. */
export const DEFAULT_MAX_DECIMALS = 2;

/** Quita los ceros sobrantes a la izquierda: "0005" → "5", "000.36" → "0.36". */
export function stripLeadingZeros(text: string): string {
  return text.replace(/^0+(?=\d)/, "");
}

/** `true` si el número no tiene más de `maxDecimals` decimales. */
export function hasMaxDecimals(value: number, maxDecimals: number): boolean {
  const [, decimals = ""] = String(value).split(".");
  return decimals.length <= maxDecimals;
}

/**
 * Normaliza lo que escribe el usuario en un input numérico.
 *
 * - Acepta coma o punto como separador decimal.
 * - Permite como máximo `maxDecimals` decimales (`0` = solo enteros).
 * - Quita ceros a la izquierda ("00000000.36" → "0.36").
 * - Completa el cero cuando se empieza con punto (".5" → "0.5").
 *
 * Devuelve `null` si el texto no es un número válido, para que el input
 * ignore esa tecla.
 */
export function normalizeNumericText(
  raw: string,
  maxDecimals = DEFAULT_MAX_DECIMALS,
): string | null {
  const text = raw.replace(",", ".");
  const pattern =
    maxDecimals > 0 ? new RegExp(`^\\d*(\\.\\d{0,${maxDecimals}})?$`) : /^\d*$/;
  if (!pattern.test(text)) return null;

  const normalized = stripLeadingZeros(text);
  return normalized.startsWith(".") ? `0${normalized}` : normalized;
}

/** Convierte el texto normalizado a número ("" o "0." → 0). */
export function numericTextToNumber(text: string): number {
  const value = Number(text);
  return Number.isNaN(value) ? 0 : value;
}
