/**
 * Cola de ventas offline en IndexedDB.
 *
 * La cola sobrevive a recargas y al cierre de sesión: cada venta guarda el
 * `userId` del cajero que la hizo y solo se sincroniza con su sesión. Tras
 * cada cambio se avisa a las demás pestañas por BroadcastChannel para que
 * refresquen el contador.
 */
import type {
  OfflineSaleErrorCode,
  QueuedOfflineSale,
} from "../dto/offline-sale.dto";

const DB_NAME = "buen-asador-pos";
const DB_VERSION = 1;
const STORE = "offline-sales";
const CHANNEL = "offline-queue";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no está disponible en este navegador"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    // Permite reintentar abrirla más tarde.
    dbPromise = null;
    throw error;
  });

  return dbPromise;
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDb();
  const tx = db.transaction(STORE, mode);
  const done = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  const result = await fn(tx.objectStore(STORE));
  await done;
  return result;
}

// ─── Aviso entre pestañas ─────────────────────────────────────────────────────

const channel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

function notifyChanged() {
  channel?.postMessage("changed");
}

export function onQueueChangedElsewhere(listener: () => void): () => void {
  if (!channel) return () => undefined;
  const handler = () => listener();
  channel.addEventListener("message", handler);
  return () => channel.removeEventListener("message", handler);
}

// ─── API ──────────────────────────────────────────────────────────────────────

const byOccurredAt = (a: QueuedOfflineSale, b: QueuedOfflineSale) =>
  a.occurredAt.localeCompare(b.occurredAt);

export const offlineQueue = {
  async add(sale: QueuedOfflineSale): Promise<void> {
    await withStore("readwrite", (store) => promisify(store.add(sale)));
    notifyChanged();
  },

  /** Todas las ventas del usuario (pendientes y con conflicto), por hora. */
  async listByUser(userId: string): Promise<QueuedOfflineSale[]> {
    const rows = await withStore("readonly", (store) =>
      promisify(
        store.index("userId").getAll(IDBKeyRange.only(userId)) as IDBRequest<
          QueuedOfflineSale[]
        >,
      ),
    );
    return rows.sort(byOccurredAt);
  },

  async listPending(userId: string): Promise<QueuedOfflineSale[]> {
    const rows = await offlineQueue.listByUser(userId);
    return rows.filter((s) => s.status === "PENDING");
  },

  async remove(id: string): Promise<void> {
    await withStore("readwrite", (store) => promisify(store.delete(id)));
    notifyChanged();
  },

  async update(
    id: string,
    patch: (sale: QueuedOfflineSale) => QueuedOfflineSale,
  ): Promise<void> {
    await withStore("readwrite", async (store) => {
      const current = (await promisify(store.get(id))) as
        | QueuedOfflineSale
        | undefined;
      if (current) await promisify(store.put(patch(current)));
    });
    notifyChanged();
  },

  incrementAttempts(id: string, errorCode?: OfflineSaleErrorCode | null) {
    return offlineQueue.update(id, (s) => ({
      ...s,
      attempts: s.attempts + 1,
      lastErrorCode: errorCode ?? s.lastErrorCode,
    }));
  },

  markConflict(
    id: string,
    errorCode: OfflineSaleErrorCode | null,
    message: string | null,
  ) {
    return offlineQueue.update(id, (s) => ({
      ...s,
      status: "CONFLICT",
      attempts: s.attempts + 1,
      lastErrorCode: errorCode ?? undefined,
      lastMessage: message ?? undefined,
    }));
  },
};
