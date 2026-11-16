/**
 * Copia local de lo que el POS necesita para vender sin conexión: el menú
 * (GET /products/menu) y el turno activo (GET /shifts/active).
 *
 * Se guarda en localStorage por usuario y sucursal cada vez que React Query
 * recibe esos datos (incluido `setQueryData` al abrir o cerrar turno). Los
 * queryFn de ambos endpoints la usan como respaldo cuando la petición falla
 * sin respuesta del servidor.
 */
import type { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";

const PREFIX = "pos-offline-cache";
const DEVICE_ID_KEY = "pos-device-id";

type CacheKind = "menu" | "active-shift";

function storageKey(kind: CacheKind): string | null {
  const user = useAuthStore.getState().user;
  if (!user?.id || !user.locationId) return null;
  return `${PREFIX}:${user.id}:${user.locationId}:${kind}`;
}

function write(kind: CacheKind, data: unknown) {
  const key = storageKey(kind);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Cuota llena o almacenamiento bloqueado: se pierde solo el respaldo.
  }
}

/** `undefined` si no hay copia; `null` es un valor válido (sin turno). */
function read<T>(kind: CacheKind): T | undefined {
  const key = storageKey(kind);
  if (!key) return undefined;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    return (JSON.parse(raw) as { data: T }).data;
  } catch {
    return undefined;
  }
}

export const offlineCache = {
  readMenu: <T>() => read<T>("menu"),
  readActiveShift: <T>() => read<T>("active-shift"),
};

/**
 * Devuelve la copia local si la petición falló por falta de conexión; si no,
 * relanza el error. Úsese en el `catch` de un queryFn.
 */
export function fallbackWhenOffline<T>(
  error: unknown,
  cached: T | undefined,
): T {
  if (isNetworkError(error) && cached !== undefined) return cached;
  throw error;
}

/** La petición falló sin respuesta del servidor (red caída o timeout). */
export function isNetworkError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    (error as { networkError?: boolean }).networkError === true
  );
}

/** Guarda en la copia local cada dato nuevo del menú y del turno activo. */
export function persistOfflineQueries(queryClient: QueryClient) {
  const menuHash = JSON.stringify(QUERY_KEYS.MENU);
  const shiftHash = JSON.stringify(QUERY_KEYS.SHIFT_ACTIVE);

  return queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated" || event.action.type !== "success") return;
    const hash = JSON.stringify(event.query.queryKey);
    if (hash === menuHash) write("menu", event.query.state.data);
    else if (hash === shiftHash)
      write("active-shift", event.query.state.data ?? null);
  });
}

/** Identificador fijo del equipo, generado una sola vez. */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "unknown-device";
  }
}

/**
 * Pide al navegador no borrar IndexedDB/localStorage por falta de espacio.
 * Sin esto, la cola de ventas offline podría perderse.
 */
export function requestPersistentStorage() {
  try {
    void navigator.storage?.persist?.().catch(() => undefined);
  } catch {
    // No soportado.
  }
}
