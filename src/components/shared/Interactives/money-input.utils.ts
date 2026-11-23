import { stripLeadingZeros } from "./numeric-input.utils";

// Convierte string del input a número limpio
// Acepta: "1.500", "1,500", "1500", "15.50", "15,50"
export function parseMoneyString(raw: string): number {
  if (!raw || raw.trim() === "") return 0;
  // Eliminar todo excepto números y punto
  const clean = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// Formatea número para mostrar: 1500.5 → "1,500.50"
export function formatForDisplay(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Limpia el string dejando solo caracteres válidos para dinero
export function sanitizeInput(raw: string, max?: number): string {
  let result = raw.replace(",", ".");
  result = result.replace(/[^0-9.]/g, "");

  // Solo un punto
  const firstDot = result.indexOf(".");
  if (firstDot !== -1) {
    result =
      result.slice(0, firstDot + 1) +
      result.slice(firstDot + 1).replace(/\./g, "");
  }

  // Sin ceros sobrantes a la izquierda ("0005" → "5", "000.36" → "0.36")
  result = stripLeadingZeros(result);
  if (result.startsWith(".")) result = `0${result}`;

  // Máximo 2 decimales
  const dotIndex = result.indexOf(".");
  if (dotIndex !== -1 && result.length > dotIndex + 3) {
    result = result.slice(0, dotIndex + 3);
  }

  // Máximo 10 dígitos enteros
  const dotPos = result.indexOf(".");
  const intPart = dotPos === -1 ? result : result.slice(0, dotPos);
  const decPart = dotPos === -1 ? "" : result.slice(dotPos);

  if (intPart.length > 10) {
    result = intPart.slice(0, 10) + decPart;
  }

  // Si hay max, no permitir valor mayor
  if (max !== undefined) {
    const numeric = parseMoneyString(result);
    if (numeric > max) {
      result = formatForDisplay(max);
    }
  }

  return result;
}
