import type { ZodSchema } from "zod";

/**
 * Convierte la validación de Zod al formato de errores de Formik.
 *
 * Cada error queda bajo el primer campo de su ruta (p. ej. `locationPrices`),
 * que es lo que Formik usa para bloquear el envío. Los errores anidados
 * (listas de objetos) se guardan además con su ruta completa
 * (`locationPrices.0.price`) para mostrarlos junto al campo exacto con
 * `getFieldError`.
 */
export function zodToFormik<T>(schema: ZodSchema<T>) {
  return (values: T): Record<string, string> => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const field = issue.path[0] as string;
      if (field && !acc[field]) acc[field] = issue.message;
      if (issue.path.length > 1) {
        const fullPath = issue.path.join(".");
        if (!acc[fullPath]) acc[fullPath] = issue.message;
      }
      return acc;
    }, {});
  };
}

/** Error de un campo anidado guardado por `zodToFormik` con su ruta completa. */
export function getFieldError(
  errors: object,
  path: string,
): string | undefined {
  return (errors as Record<string, string | undefined>)[path];
}
