import axios from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import { isGatewayStatus } from "@/services/interceptors/error-message";
import { markOffline, markOnline } from "../stores/offline.store";

/**
 * Cliente sin interceptores para sondear la conexión: así un fallo no
 * muestra toasts ni intenta renovar el token.
 */
const probeClient = axios.create({ baseURL: env.API_URL, timeout: 5_000 });

/**
 * Comprueba si el backend responde. Cualquier respuesta del backend (incluso
 * 401) cuenta como conexión. La falta de respuesta, o un 502/503/504 del
 * proxy (backend caído), deja el POS offline.
 */
export async function probeConnection(): Promise<boolean> {
  const token = useAuthStore.getState().token;
  try {
    await probeClient.get("/shifts/active", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    markOnline();
    return true;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      !isGatewayStatus(error.response.status)
    ) {
      markOnline();
      return true;
    }
    markOffline();
    return false;
  }
}
