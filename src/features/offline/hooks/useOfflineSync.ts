import { useEffect, useRef } from "react";
import { RoleEnum } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { onQueueChangedElsewhere } from "../services/offline-queue";
import { requestPersistentStorage } from "../services/offline-cache";
import { probeConnection } from "../services/connectivity";
import { syncOfflineQueue } from "../services/offline-sync.service";
import {
  markOffline,
  selectPendingCount,
  useOfflineStore,
} from "../stores/offline.store";

/** Cada cuánto se sondea el backend (offline) o se reintenta la cola. */
const SYNC_INTERVAL_MS = 20_000;

/**
 * Mantiene la cola de ventas offline: la carga al iniciar sesión, la
 * sincroniza al iniciar, al volver la conexión y cada 30 s mientras haya
 * pendientes, y sondea el backend mientras el POS está offline.
 *
 * Montar una sola vez, en el layout autenticado.
 */
export function useOfflineSync() {
  const userId = useAuthStore((s) => s.user?.id);
  const isCashier = useAuthStore((s) => s.user?.role === RoleEnum.CASHIER);
  const isOffline = useOfflineStore((s) => s.isOffline);
  const pending = useOfflineStore(selectPendingCount);
  const refresh = useOfflineStore((s) => s.refresh);
  const wasOffline = useRef(isOffline);

  // Cola del usuario actual (también al cambiar de usuario).
  useEffect(() => {
    void refresh();
  }, [userId, refresh]);

  // Otras pestañas avisan cuando cambian la cola.
  useEffect(() => onQueueChangedElsewhere(() => void refresh()), [refresh]);

  // Al iniciar: pedir almacenamiento persistente y sincronizar.
  useEffect(() => {
    if (!userId || !isCashier) return;
    requestPersistentStorage();
    void syncOfflineQueue();
  }, [userId, isCashier]);

  // Eventos del navegador: primera señal, no del todo confiable.
  useEffect(() => {
    const handleOffline = () => markOffline();
    const handleOnline = () => {
      void probeConnection().then((online) => {
        if (online) void syncOfflineQueue();
      });
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Volvió la conexión (detectada por cualquier petición): sincronizar.
  useEffect(() => {
    if (wasOffline.current && !isOffline && isCashier) {
      void syncOfflineQueue();
    }
    wasOffline.current = isOffline;
  }, [isOffline, isCashier]);

  // Mientras esté offline o haya pendientes: sondear y reintentar.
  useEffect(() => {
    if (!userId || (!isOffline && pending === 0)) return;
    const timer = setInterval(() => {
      if (useOfflineStore.getState().isOffline) {
        void probeConnection();
      } else if (isCashier) {
        void syncOfflineQueue();
      }
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [userId, isCashier, isOffline, pending]);
}
