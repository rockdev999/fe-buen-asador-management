import axios from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import { markOffline, markOnline } from "../stores/offline.store";

/**
 * Cliente sin interceptores para sondear la conexión: así un fallo no
 * muestra toasts ni intenta renovar el token.
 */
const probeClient = axios.create({ baseURL: env.API_URL, timeout: 5_000 });

/**
 * Comprueba si el backend responde. Cualquier respuesta (incluso 401) cuenta
 * como conexión; solo la falta de respuesta deja el POS offline.
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
    if (axios.isAxiosError(error) && error.response) {
      markOnline();
      return true;
    }
    markOffline();
    return false;
  }
}
