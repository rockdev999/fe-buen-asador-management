import { appConfig } from "@/config/app.config";
import { env } from "@/config/env";
import axios from "axios";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { errorInterceptor } from "./interceptors/error.interceptor";
import { setupRetryInterceptor } from "./interceptors/retry.interceptor";

export const httpClient = axios.create({
  baseURL: env.API_URL,
  timeout: appConfig.http.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use(authInterceptor);
httpClient.interceptors.response.use(undefined, errorInterceptor);
setupRetryInterceptor(httpClient);
