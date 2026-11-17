import { appConfig } from "@/config/app.config";
import { env } from "@/config/env";
import axios from "axios";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { errorInterceptor } from "./interceptors/error.interceptor";
import { markOnline } from "@/features/offline/stores/offline.store";

export const httpClient = axios.create({
  baseURL: env.API_URL,
  timeout: appConfig.http.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Para operaciones que no deben cortarse del lado del cliente: si se cancela
 * por timeout, el servidor pudo haberla completado igual y la UI quedaría
 * mostrando un error falso. Uso: `httpClient.post(url, body, NO_TIMEOUT)`.
 */
export const NO_TIMEOUT = { timeout: 0 } as const;

httpClient.interceptors.request.use(authInterceptor);
httpClient.interceptors.response.use(
  (response) => {
    // Cualquier respuesta confirma que hay conexión con el backend.
    markOnline();
    return response;
  },
  (error) => errorInterceptor(error, httpClient),
);
