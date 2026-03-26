import type { ZodSchema } from "zod";

export function zodToFormik<T>(schema: ZodSchema<T>) {
  return (values: T): Record<string, string> => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const field = issue.path[0] as string;
      if (field && !acc[field]) acc[field] = issue.message;
      return acc;
    }, {});
  };
}
