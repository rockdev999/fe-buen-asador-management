/**
 * Envía la cola de ventas offline a POST /sales/offline-sync.
 *
 * - Una sola sincronización a la vez, también entre pestañas (navigator.locks).
 * - Lotes de 50, respetando el límite de 2 peticiones por segundo.
 * - CREATED / DUPLICATE salen de la cola; REJECTED reintentable se queda;
 *   REJECTED no reintentable pasa a "con conflicto".
 * - Si el lote falla sin respuesta o con 5xx, la cola queda intacta y se
 *   reintenta en la próxima pasada (evento `online`, intervalo, etc.).
 */
import { toast } from "sonner";
import { QUERY_KEYS, RoleEnum } from "@/constants";
import { queryClient } from "@/lib/query-client";
import { httpClient } from "@/services/http.client";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api.types";
import type {
  OfflineSaleWarning,
  SyncOfflineSalesRequestDTO,
  SyncOfflineSalesResponseDTO,
} from "../dto/offline-sale.dto";
import { useOfflineStore } from "../stores/offline.store";
import { getDeviceId } from "./offline-cache";
import { offlineQueue } from "./offline-queue";
import { toOfflineSaleDto } from "../utils/offline-sale.builder";

const BATCH_SIZE = 50;
const BATCH_GAP_MS = 600;
const RATE_LIMIT_WAIT_MS = 1_100;

export interface OfflineSyncOutcome {
  /** El lote llegó al servidor y se procesó (aunque haya rechazos). */
  ok: boolean;
  synced: number;
  conflicts: number;
  retryLater: number;
  warnings: Partial<Record<OfflineSaleWarning, number>>;
}

const WARNING_LABELS: Record<OfflineSaleWarning, (n: number) => string> = {
  PRICE_CHANGED: (n) => `${n} con precio distinto al catálogo`,
  PRODUCT_NOT_SELLABLE: (n) => `${n} con producto desactivado`,
  MODIFIER_NOT_OFFERED: (n) =>
    `${n} con modificador que ya no se ofrece en la sucursal`,
  TICKET_CODE_REGENERATED: (n) => `${n} con código de ticket nuevo`,
  OCCURRED_AT_ADJUSTED: (n) =>
    `${n} con hora ajustada (revisa el reloj del equipo)`,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let running: Promise<OfflineSyncOutcome | null> | null = null;

/**
 * Sincroniza las ventas pendientes del usuario con sesión iniciada.
 * Devuelve null si no hay nada que hacer o si otra pestaña ya está
 * sincronizando.
 */
export function syncOfflineQueue(
  options: { notify?: boolean } = {},
): Promise<OfflineSyncOutcome | null> {
  if (running) return running;

  const exec = () => runSync(options.notify ?? true);
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;

  // ifAvailable: si otra pestaña tiene el lock, esta no sincroniza (lock null).
  // El .then aplana la promesa que devuelve el callback (los tipos del DOM no
  // la desenvuelven).
  const task: Promise<OfflineSyncOutcome | null> = locks
    ? locks
        .request("offline-sync", { ifAvailable: true }, (lock) =>
          lock ? exec() : Promise.resolve(null),
        )
        .then((result) => result)
    : exec();

  const current = task.finally(() => {
    running = null;
  });
  running = current;
  return current;
}

async function runSync(notify: boolean): Promise<OfflineSyncOutcome | null> {
  const user = useAuthStore.getState().user;
  const store = useOfflineStore.getState();
  if (!user || user.role !== RoleEnum.CASHIER) return null;

  const pending = await offlineQueue.listPending(user.id).catch(() => []);
  if (pending.length === 0) {
    await store.refresh();
    return null;
  }

  store.setSyncing(true);
  const outcome: OfflineSyncOutcome = {
    ok: true,
    synced: 0,
    conflicts: 0,
    retryLater: 0,
    warnings: {},
  };

  try {
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      const body: SyncOfflineSalesRequestDTO = {
        deviceId: getDeviceId(),
        sales: batch.map(toOfflineSaleDto),
      };

      const response = await postBatch(body);

      for (const r of response.results) {
        if (!r.id) continue;
        if (r.status === "CREATED" || r.status === "DUPLICATE") {
          await offlineQueue.remove(r.id);
          outcome.synced += 1;
          for (const w of r.warnings ?? []) {
            outcome.warnings[w] = (outcome.warnings[w] ?? 0) + 1;
          }
        } else if (r.retryable) {
          await offlineQueue.incrementAttempts(r.id, r.errorCode);
          outcome.retryLater += 1;
        } else {
          await offlineQueue.markConflict(r.id, r.errorCode, r.message);
          outcome.conflicts += 1;
        }
      }

      if (i + BATCH_SIZE < pending.length) await sleep(BATCH_GAP_MS);
    }
  } catch {
    // Sin respuesta, 5xx, 401 sin renovar, 403...: la cola queda como está.
    outcome.ok = false;
  } finally {
    store.setSyncing(false);
    await store.refresh();
  }

  if (outcome.synced > 0) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SALES });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHIFTS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORY });
  }

  if (notify) notifyOutcome(outcome);
  return outcome;
}

async function postBatch(
  body: SyncOfflineSalesRequestDTO,
): Promise<SyncOfflineSalesResponseDTO> {
  const send = () =>
    httpClient
      .post<ApiResponse<SyncOfflineSalesResponseDTO>>(
        "/sales/offline-sync",
        body,
        { silentErrors: true },
      )
      .then((r) => r.data.data!);

  try {
    return await send();
  } catch (error) {
    // 429: esperar un poco y reintentar una vez.
    if ((error as { status?: number })?.status === 429) {
      await sleep(RATE_LIMIT_WAIT_MS);
      return send();
    }
    throw error;
  }
}

function notifyOutcome(outcome: OfflineSyncOutcome) {
  if (outcome.synced > 0) {
    const warnings = (
      Object.entries(outcome.warnings) as [OfflineSaleWarning, number][]
    ).map(([code, n]) => WARNING_LABELS[code](n));
    const title =
      outcome.synced === 1
        ? "1 venta offline sincronizada"
        : `${outcome.synced} ventas offline sincronizadas`;
    toast.success(warnings.length ? `${title} · ${warnings.join(" · ")}` : title, {
      id: "offline-sync-result",
    });
  }
  if (outcome.conflicts > 0) {
    toast.error(
      outcome.conflicts === 1
        ? "1 venta offline no se pudo registrar. Revísala en el indicador de ventas offline."
        : `${outcome.conflicts} ventas offline no se pudieron registrar. Revísalas en el indicador de ventas offline.`,
      { id: "offline-sync-conflicts" },
    );
  }
}
