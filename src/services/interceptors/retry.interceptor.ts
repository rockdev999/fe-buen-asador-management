import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { appConfig } from "@/config/app.config";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

export function setupRetryInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    // Si no hay config no podemos reintentar
    if (!config) return Promise.reject(error);

    const isTimeout = error.code === "ECONNABORTED";
    const isNetworkError = !error.response;

    // Solo reintentamos en timeout o sin respuesta del servidor
    if (!isTimeout && !isNetworkError) {
      return Promise.reject(error);
    }

    config._retryCount = config._retryCount ?? 0;

    if (config._retryCount >= appConfig.http.maxRetries) {
      return Promise.reject(error);
    }

    config._retryCount += 1;

    // Espera progresiva: 1s, 2s, 3s...
    await new Promise((r) => setTimeout(r, 1000 * config._retryCount!));

    return instance(config);
  });
}
