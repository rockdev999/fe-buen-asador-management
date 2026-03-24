import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

export function authInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const { token, tempToken } = useAuthStore.getState();

  const activeToken = token ?? tempToken;
  if (activeToken) {
    config.headers.Authorization = `Bearer ${activeToken}`;
  }
  return config;
}
