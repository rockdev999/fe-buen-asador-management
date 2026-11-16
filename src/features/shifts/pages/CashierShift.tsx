import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Lock,
  Printer,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  selectConflictCount,
  selectPendingCount,
  useOfflineStore,
} from "@/features/offline/stores/offline.store";
import { syncOfflineQueue } from "@/features/offline/services/offline-sync.service";
import { OfflineQueueModal } from "@/features/offline/components/OfflineQueueModal";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { Button } from "@/components/shared/Basics/Button";
import { PaymentMethodEnum } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { PATHS } from "@/routes/paths";
import {
  useActiveShift,
  useActiveShiftSummary,
} from "@/features/pos/hooks/useShift";
import { Shift, ShiftReceipt } from "@/features/pos/models/shift";
import { usePrintTicket } from "@/features/pos/hooks/usePrintTicket";
import { differenceTone } from "@/utils/generalStatus/shift-display";
import { ShiftReceiptPrint } from "../components/ShiftReceiptPrint";
import { PAYMENT_LABELS } from "@/utils/generalStatus/sale-display";
import { SummaryStat } from "../components/SummaryStat";
import { CloseShiftModal } from "./components/CloseShiftModal";

const PAYMENT_METHODS = [
  PaymentMethodEnum.CASH,
  PaymentMethodEnum.QR,
  PaymentMethodEnum.BANK_TRANSFER,
];

/**
 * Caja del cajero: estado del turno activo, resumen y cierre.
 *
 * Cierre ciego para todos los métodos: el backend envía los montos del
 * resumen en null y la pantalla solo muestra cantidades.
 */
export function CashierShift() {
  const navigate = useNavigate();
  const { data: shift, isOpen, status: shiftStatus } = useActiveShift();
  const { data: summary, status: summaryStatus } =
    useActiveShiftSummary(isOpen);

  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [closed, setClosed] = useState<{
    shift: Shift;
    receipt: ShiftReceipt;
  } | null>(null);

  const isLoading =
    shiftStatus === "pending" || (isOpen && summaryStatus === "pending");
  const pendingOrders = summary?.pendingOrders ?? 0;

  // Ventas offline: el cierre se bloquea mientras queden en la cola, porque
  // el backend rechaza las de un turno ya cerrado (OFFLINE_SHIFT_NOT_OPEN).
  const isOffline = useOfflineStore((s) => s.isOffline);
  const offlinePending = useOfflineStore(selectPendingCount);
  const offlineConflicts = useOfflineStore(selectConflictCount);
  const offlineSyncing = useOfflineStore((s) => s.syncing);
  const offlineUnsynced = offlinePending + offlineConflicts;
  const [checkingClose, setCheckingClose] = useState(false);
  const [showOfflineQueue, setShowOfflineQueue] = useState(false);

  useEffect(() => {
    if (isOpen) void syncOfflineQueue();
  }, [isOpen]);

  const closeBlockedReason = isOffline
    ? "Sin conexión no se puede cerrar el turno"
    : offlineUnsynced > 0
      ? "Hay ventas offline sin sincronizar"
      : pendingOrders > 0
        ? "Cobra o cancela los pedidos pendientes antes de cerrar"
        : undefined;

  /** Siempre sincroniza antes de permitir el cierre. */
  async function handleRequestClose() {
    setCheckingClose(true);
    try {
      await syncOfflineQueue();
    } finally {
      setCheckingClose(false);
    }
    const state = useOfflineStore.getState();
    if (state.isOffline) {
      toast.error("Sin conexión no se puede cerrar el turno.");
      return;
    }
    if (state.sales.length > 0) {
      toast.error(
        "Quedan ventas offline sin sincronizar. Resuélvelas antes de cerrar el turno.",
      );
      setShowOfflineQueue(true);
      return;
    }
    setOpenCloseModal(true);
  }

  const methodCount = (method: PaymentMethodEnum) =>
    summary?.sales.byPaymentMethod.find((m) => m.method === method);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader
        title="Caja"
        subtitle={
          isOpen && shift
            ? `Turno abierto el ${formatLocalDateTime(shift.openedAt)}`
            : "Turno de caja"
        }
        actions={
          isOpen && (
            <Button
              size="sm"
              onClick={() => void handleRequestClose()}
              isLoading={checkingClose}
              loadingText="Sincronizando..."
              disabled={
                !!closeBlockedReason || summaryStatus !== "success"
              }
              title={closeBlockedReason}
            >
              <Lock size={13} />
              Cerrar turno
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current text-muted-foreground/40" />
          </div>
        ) : closed ? (
          <ClosedState
            shift={closed.shift}
            receipt={closed.receipt}
            onGoToPos={() => navigate(PATHS.POS)}
          />
        ) : !isOpen || !shift ? (
          <EmptyState onGoToPos={() => navigate(PATHS.POS)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {(offlineUnsynced > 0 || isOffline) && (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-3.5 py-3",
                  offlineConflicts > 0
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50",
                )}
              >
                <WifiOff
                  size={15}
                  className={cn(
                    "mt-0.5 shrink-0",
                    offlineConflicts > 0 ? "text-red-500" : "text-amber-500",
                  )}
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-[12px] font-semibold",
                      offlineConflicts > 0 ? "text-red-800" : "text-amber-800",
                    )}
                  >
                    {offlineUnsynced === 0
                      ? "Sin conexión"
                      : [
                          offlinePending > 0 &&
                            (offlinePending === 1
                              ? "1 venta offline pendiente de envío"
                              : `${offlinePending} ventas offline pendientes de envío`),
                          offlineConflicts > 0 &&
                            (offlineConflicts === 1
                              ? "1 venta offline con conflicto"
                              : `${offlineConflicts} ventas offline con conflicto`),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-[11px]",
                      offlineConflicts > 0 ? "text-red-700" : "text-amber-700",
                    )}
                  >
                    {isOffline
                      ? "El turno se puede cerrar cuando vuelva la conexión y se sincronicen las ventas."
                      : offlineConflicts > 0
                        ? "El servidor las rechazó. Revísalas con el administrador antes de cerrar."
                        : "Se están enviando al servidor. El turno se puede cerrar cuando terminen."}
                  </p>
                </div>
                {offlineUnsynced > 0 && (
                  <Button
                    size="xs"
                    variant="outline"
                    isLoading={offlineSyncing}
                    onClick={() => setShowOfflineQueue(true)}
                  >
                    Ver ventas
                  </Button>
                )}
              </div>
            )}

            {pendingOrders > 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-amber-800">
                    {pendingOrders === 1
                      ? "Hay 1 pedido sin cobrar ni cancelar"
                      : `Hay ${pendingOrders} pedidos sin cobrar ni cancelar`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-700">
                    Resuélvelos antes de cerrar el turno.
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate(PATHS.ORDERS)}
                >
                  Ver pedidos
                </Button>
              </div>
            )}

            <section>
              <h2 className="mb-2 text-[12px] font-semibold text-inkblack">
                Turno
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <SummaryStat
                  label="Monto inicial"
                  value={formatMoney(shift.initialAmount)}
                />
                <SummaryStat
                  label="Apertura"
                  value={formatLocalDateTime(shift.openedAt)}
                />
                <SummaryStat label="Cajero" value={shift.cashier.name} />
              </div>
            </section>

            {summary && (
              <>
                <section>
                  <h2 className="mb-2 text-[12px] font-semibold text-inkblack">
                    Ventas
                  </h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <SummaryStat
                      label="Ventas cobradas"
                      value={summary.sales.count}
                    />
                    {PAYMENT_METHODS.map((method) => (
                      <SummaryStat
                        key={method}
                        label={PAYMENT_LABELS[method]}
                        value={methodCount(method)?.count ?? 0}
                        hint="ventas"
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-2 text-[12px] font-semibold text-inkblack">
                    Movimientos
                  </h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <SummaryStat
                      label="Ventas anuladas"
                      value={summary.sales.annulled.count}
                    />
                    <SummaryStat
                      label="Egresos"
                      value={summary.expenses.count}
                    />
                    <SummaryStat
                      label="Pagos de nómina"
                      value={summary.payroll.count}
                    />
                    <SummaryStat
                      label="Pedidos pendientes"
                      value={summary.pendingOrders}
                    />
                  </div>
                </section>

                <p className="text-[11px] text-muted-foreground">
                  Al cerrar, declara el efectivo contado en caja, el total de la
                  app del QR y el total del tarjetero. El sistema los compara
                  con lo esperado y el administrador revisa el cierre.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {showOfflineQueue && (
        <OfflineQueueModal onClose={() => setShowOfflineQueue(false)} />
      )}

      {openCloseModal && (
        <CloseShiftModal
          onClose={() => setOpenCloseModal(false)}
          onSuccess={(result) => {
            setOpenCloseModal(false);
            setClosed(result);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ onGoToPos }: { onGoToPos: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-inkblack/30">
        <Archive size={20} />
      </div>
      <div>
        <p className="text-[13px] font-medium text-inkblack">
          No tienes un turno abierto
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Abre un turno desde el punto de venta para empezar a operar.
        </p>
      </div>
      <Button size="sm" onClick={onGoToPos}>
        Ir al punto de venta
      </Button>
    </div>
  );
}

/**
 * Turno recién cerrado. Los montos ya quedaron fijos, así que se muestra el
 * cuadre completo (declarado vs esperado) y se imprime el comprobante para
 * que el cajero lo firme. Se puede reimprimir desde aquí.
 */
function ClosedState({
  shift,
  receipt,
  onGoToPos,
}: {
  shift: Shift;
  receipt: ShiftReceipt;
  onGoToPos: () => void;
}) {
  const { ticketRef, print } = usePrintTicket();
  const printedRef = useRef(false);

  // Impresión automática una sola vez, como el ticket de venta.
  useEffect(() => {
    if (printedRef.current) return;
    printedRef.current = true;
    print();
  }, [print]);

  const money = (value: number | null | undefined) =>
    value == null ? "—" : formatMoney(value);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ShiftReceiptPrint ref={ticketRef} receipt={receipt} />
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
        <CheckCircle2 size={22} />
      </div>
      <div>
        <p className="text-[13px] font-medium text-inkblack">Turno cerrado</p>
        <p className="mt-0.5 max-w-sm text-[12px] text-muted-foreground">
          El cierre queda pendiente de aprobación del administrador.
        </p>
      </div>

      {shift.reconciliation && (
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-surface bg-white text-left">
          <table className="w-full text-[12px]">
            <thead className="bg-surface/50 text-[11px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Método</th>
                <th className="px-3 py-2 text-right font-medium">Declarado</th>
                <th className="px-3 py-2 text-right font-medium">Esperado</th>
                <th className="px-3 py-2 text-right font-medium">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_METHODS.map((method) => {
                const row = shift.reconciliation?.find(
                  (r) => r.method === method,
                );
                return (
                  <tr key={method} className="border-t border-surface">
                    <td className="px-3 py-1.5">{PAYMENT_LABELS[method]}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {money(row?.declared)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                      {money(row?.expected)}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-1.5 text-right font-semibold tabular-nums",
                        differenceTone(row?.difference ?? null),
                      )}
                    >
                      {money(row?.difference)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={print}>
          <Printer size={13} />
          Reimprimir comprobante
        </Button>
        <Button size="sm" onClick={onGoToPos}>
          Abrir un nuevo turno
        </Button>
      </div>
    </div>
  );
}
