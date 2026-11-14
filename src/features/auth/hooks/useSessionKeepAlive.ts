import { useEffect } from "react";
import { refreshSession } from "@/services/auth/session.service";
import { useAuthStore } from "@/stores/auth.store";

/** Cuánto antes del vencimiento se renueva. */
const REFRESH_AHEAD_MS = 60_000;
/**
 * Margen aleatorio extra para que varias pestañas no renueven en el mismo
 * instante (la primera rota el token; las demás lo reciben vía `storage`).
 */
const MAX_JITTER_MS = 10_000;

/**
 * Renueva el access token poco antes de que venza, para que el usuario no
 * llegue a ver un 401. Es una optimización: si el timer no corre (pestaña en
 * segundo plano, equipo suspendido), el interceptor de axios renueva igual.
 *
 * Montar una sola vez, en el layout autenticado.
 */
export function useSessionKeepAlive() {
  const token = useAuthStore((s) => s.token);
  const expiresAt = useAuthStore((s) => s.accessTokenExpiresAt);
  const hasRefreshToken = useAuthStore((s) => !!s.refreshToken);

  useEffect(() => {
    if (!token || !expiresAt || !hasRefreshToken) return;

    const jitter = Math.random() * MAX_JITTER_MS;
    const delay = Math.max(0, expiresAt - Date.now() - REFRESH_AHEAD_MS - jitter);

    const timer = setTimeout(() => {
      // Si otra pestaña ya renovó, refreshSession reutiliza su token. Si falla
      // por 401 ya cerró la sesión; si es error de red, el interceptor
      // reintentará cuando haga falta.
      refreshSession(token).catch(() => undefined);
    }, delay);

    // Al cambiar `token` (renovación aquí o en otra pestaña) se reprograma.
    return () => clearTimeout(timer);
  }, [token, expiresAt, hasRefreshToken]);
}
