export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  code: number;
  errorCode: string;
  message: string;
  errors: { field: string; message: string }[];
  timestamp: string;
  path: string;
  /**
   * La petición falló sin respuesta del servidor (red caída o timeout). Lo
   * agrega el interceptor de errores; con esto el POS ofrece la venta offline.
   */
  networkError?: boolean;
  /** Status HTTP de la respuesta, si la hubo (lo agrega el interceptor). */
  status?: number;
}

declare module "axios" {
  interface AxiosRequestConfig {
    /** No mostrar toasts de error para esta petición (p. ej. sincronización en segundo plano). */
    silentErrors?: boolean;
    /**
     * errorCode que quien hace la petición maneja por su cuenta (con su propio
     * aviso): el interceptor no muestra el toast genérico para ellos.
     */
    handledErrorCodes?: string[];
  }
}
