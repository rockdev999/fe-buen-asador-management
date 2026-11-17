import type { ApiErrorResponse } from "@/types/api.types";

type FieldError = ApiErrorResponse["errors"][number];

/** Cuántos campos se listan en el toast antes de resumir con "y N más". */
export const MAX_LISTED_FIELDS = 3;

/** Nombres legibles de los campos más comunes del API. */
const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  firstName: "Nombre",
  lastName: "Apellido",
  email: "Correo",
  phone: "Teléfono",
  password: "Contraseña",
  currentPassword: "Contraseña actual",
  newPassword: "Nueva contraseña",
  role: "Rol",
  description: "Descripción",
  price: "Precio",
  cost: "Costo",
  quantity: "Cantidad",
  amount: "Monto",
  stock: "Stock",
  unit: "Unidad",
  notes: "Notas",
  reason: "Motivo",
  address: "Dirección",
  categoryId: "Categoría",
  productId: "Producto",
  locationId: "Sucursal",
  userId: "Usuario",
  items: "Ítems",
  modifiers: "Modificadores",
  paymentMethod: "Método de pago",
  openingAmount: "Monto de apertura",
  closingAmount: "Monto de cierre",
  date: "Fecha",
  startDate: "Fecha de inicio",
  endDate: "Fecha de fin",
};

/**
 * `items.0.quantity` → "Ítems #1 › Cantidad". Los segmentos desconocidos se
 * muestran tal cual.
 */
export function formatFieldPath(field: string): string {
  const parts: string[] = [];
  for (const segment of field.split(".")) {
    if (/^\d+$/.test(segment) && parts.length) {
      parts[parts.length - 1] += ` #${Number(segment) + 1}`;
    } else {
      parts.push(FIELD_LABELS[segment] ?? segment);
    }
  }
  return parts.join(" › ");
}

/**
 * El backend aún envía `errors[].message` en inglés (class-validator). Se
 * traducen los patrones habituales; si no coincide ninguno, se muestra el
 * texto original.
 */
const MESSAGE_PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/should not be empty|must not be empty/i, () => "es obligatorio"],
  [/should not exist/i, () => "no está permitido"],
  [/must be an email/i, () => "debe ser un correo válido"],
  [/must be a UUID/i, () => "no es un identificador válido"],
  [/must not be less than (-?[\d.]+)/i, (m) => `debe ser al menos ${m[1]}`],
  [
    /must not be greater than (-?[\d.]+)/i,
    (m) => `no puede ser mayor a ${m[1]}`,
  ],
  [/must be a positive number/i, () => "debe ser mayor a 0"],
  [
    /must be longer than or equal to (\d+)/i,
    (m) => `debe tener al menos ${m[1]} caracteres`,
  ],
  [
    /must be shorter than or equal to (\d+)/i,
    (m) => `debe tener como máximo ${m[1]} caracteres`,
  ],
  [/must be an integer/i, () => "debe ser un número entero"],
  [/must be a number/i, () => "debe ser un número"],
  [/must be a string/i, () => "debe ser texto"],
  [/must be a boolean/i, () => "debe ser verdadero o falso"],
  [/must be an array/i, () => "debe ser una lista"],
  [
    /must contain at least (\d+) elements?/i,
    (m) => `debe tener al menos ${m[1]} elemento(s)`,
  ],
  [
    /must be a valid ISO 8601 date|must be a Date/i,
    () => "debe ser una fecha válida",
  ],
  [/must be one of the following values/i, () => "tiene un valor no permitido"],
];

export function translateFieldMessage(message: string): string {
  for (const [pattern, build] of MESSAGE_PATTERNS) {
    const match = message.match(pattern);
    if (match) return build(match);
  }
  return message;
}

/** Una línea por campo; los repetidos (varias reglas del mismo campo) se unen. */
export function summarizeFieldErrors(fields: FieldError[]): string[] {
  const byField = new Map<string, string[]>();
  for (const { field, message } of fields) {
    const list = byField.get(field) ?? [];
    const text = translateFieldMessage(message);
    if (!list.includes(text)) list.push(text);
    byField.set(field, list);
  }

  const lines = [...byField].map(
    ([field, messages]) => `${formatFieldPath(field)}: ${messages.join(", ")}`,
  );
  if (lines.length <= MAX_LISTED_FIELDS) return lines;
  const rest = lines.length - MAX_LISTED_FIELDS;
  return [
    ...lines.slice(0, MAX_LISTED_FIELDS),
    `y ${rest} campo${rest === 1 ? "" : "s"} más`,
  ];
}

/** Más líneas, más tiempo para leerlas: 6 s base + 1.5 s por línea, máx. 12 s. */
export function validationToastDuration(lineCount: number): number {
  return Math.min(6000 + lineCount * 1500, 12_000);
}
