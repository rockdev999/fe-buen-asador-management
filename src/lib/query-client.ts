import { QueryClient } from "@tanstack/react-query";

/** Cuántas veces se reintenta una consulta que falló por un error del servidor. */
const MAX_QUERY_RETRIES = 1;

/**
 * Decide si React Query reintenta una consulta. Cada intento fallido pasa por
 * el interceptor de errores (y su toast), así que solo se reintenta lo que
 * puede salir distinto la segunda vez:
 *
 * - 5xx propio del backend: suele ser transitorio. El reintento es casi
 *   inmediato y su toast usa el mismo id, así que reemplaza al anterior.
 *
 * No se reintenta:
 * - 4xx (validación, permisos, no encontrado...): fallará igual.
 * - 401: el interceptor ya renovó el token y reintentó.
 * - Sin conexión / 502-503-504 (`networkError`): el POS pasa a offline y se
 *   usa la copia local; reintentar solo demora ese fallback.
 * - Timeout: otro intento son 10 s más de espera y un segundo aviso, porque
 *   el primero ya se cerró.
 * - Cancelada: se abortó a propósito.
 */
export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  const { status, networkError, canceled } = (error ?? {}) as {
    status?: number;
    networkError?: boolean;
    canceled?: boolean;
  };
  if (canceled || networkError) return false;
  return status !== undefined && status >= 500 && status < 600;
}

/**
 * Instancia única de React Query. Vive fuera de React para que módulos sin
 * hooks (p. ej. el logout disparado desde el interceptor de axios) puedan
 * limpiar la caché.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      staleTime: 1000 * 60 * 5, // Considera los datos frescos durante 5 minutos
      refetchOnWindowFocus: false, // No refetch al enfocar la ventana, para evitar consultas innecesarias
    },
  },
});
