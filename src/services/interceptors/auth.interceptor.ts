import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

export function authInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}
