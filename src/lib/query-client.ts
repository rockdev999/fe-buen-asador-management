import { QueryClient } from "@tanstack/react-query";

/**
 * Instancia única de React Query. Vive fuera de React para que módulos sin
 * hooks (p. ej. el logout disparado desde el interceptor de axios) puedan
 * limpiar la caché.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Repite la consulta una vez en caso de error
      staleTime: 1000 * 60 * 5, // Considera los datos frescos durante 5 minutos
      refetchOnWindowFocus: false, // No refetch al enfocar la ventana, para evitar consultas innecesarias
    },
  },
});
