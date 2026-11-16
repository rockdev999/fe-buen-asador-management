import { create } from "zustand";
import { useAuthStore } from "@/stores/auth.store";
import type { QueuedOfflineSale } from "../dto/offline-sale.dto";
import { offlineQueue } from "../services/offline-queue";

interface OfflineState {
  /**
   * El POS está sin conexión al backend. Se activa cuando una petición falla
   * sin respuesta (o con el evento `offline`) y se desactiva con la primera
   * respuesta del servidor, aunque sea un error.
   */
  isOffline: boolean;
  /** Ventas en cola del usuario con sesión iniciada. */
  sales: QueuedOfflineSale[];
  syncing: boolean;

  setOffline: (value: boolean) => void;
  setSyncing: (value: boolean) => void;
  /** Relee la cola del usuario actual desde IndexedDB. */
  refresh: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
  sales: [],
  syncing: false,

  setOffline: (value) =>
    set((state) => (state.isOffline === value ? state : { isOffline: value })),

  setSyncing: (value) => set({ syncing: value }),

  refresh: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      set({ sales: [] });
      return;
    }
    try {
      set({ sales: await offlineQueue.listByUser(userId) });
    } catch {
      // IndexedDB no disponible: se deja la lista como estaba.
    }
  },
}));

export const selectPendingCount = (s: OfflineState) =>
  s.sales.filter((sale) => sale.status === "PENDING").length;

export const selectConflictCount = (s: OfflineState) =>
  s.sales.filter((sale) => sale.status === "CONFLICT").length;

export const markOnline = () => useOfflineStore.getState().setOffline(false);
export const markOffline = () => useOfflineStore.getState().setOffline(true);
