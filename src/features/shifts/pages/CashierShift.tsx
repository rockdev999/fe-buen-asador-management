import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Archive, CheckCircle2, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { Button } from "@/components/shared/Basics/Button";
import { PaymentMethodEnum } from "@/constants";
import { formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { PATHS } from "@/routes/paths";
import {
  useActiveShift,
  useActiveShiftSummary,
} from "@/features/pos/hooks/useShift";
import { Shift } from "@/features/pos/models/shift";
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
  const { data: summary, status: summaryStatus } = useActiveShiftSummary(isOpen);

  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [closedShift, setClosedShift] = useState<Shift | null>(null);

  const isLoading =
    shiftStatus === "pending" || (isOpen && summaryStatus === "pending");
  const pendingOrders = summary?.pendingOrders ?? 0;

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
              onClick={() => setOpenCloseModal(true)}
              disabled={pendingOrders > 0 || summaryStatus !== "success"}
              title={
                pendingOrders > 0
                  ? "Cobra o cancela los pedidos pendientes antes de cerrar"
                  : undefined
              }
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
        ) : closedShift ? (
          <ClosedState shift={closedShift} onGoToPos={() => navigate(PATHS.POS)} />
        ) : !isOpen || !shift ? (
          <EmptyState onGoToPos={() => navigate(PATHS.POS)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
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
                  Al cerrar, declara el efectivo contado en caja, el total de
                  la app del QR y el total del tarjetero. El sistema los
                  compara con lo esperado y el administrador revisa el cierre.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {openCloseModal && (
        <CloseShiftModal
          onClose={() => setOpenCloseModal(false)}
          onSuccess={(shift) => {
            setOpenCloseModal(false);
            setClosedShift(shift);
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

function ClosedState({
  shift,
  onGoToPos,
}: {
  shift: Shift;
  onGoToPos: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
        <CheckCircle2 size={22} />
      </div>
      <div>
        <p className="text-[13px] font-medium text-inkblack">
          Turno cerrado
        </p>
        <p className="mt-0.5 max-w-sm text-[12px] text-muted-foreground">
          El cierre queda pendiente de aprobación del administrador.
        </p>
      </div>
      {/* Solo lo declarado: lo esperado no se muestra al cajero. */}
      {shift.reconciliation && (
        <div className="w-full max-w-xs rounded-xl border border-surface bg-white px-4 py-3 text-left">
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
            Declaraste
          </p>
          {PAYMENT_METHODS.map((method) => {
            const row = shift.reconciliation?.find((r) => r.method === method);
            return (
              <div
                key={method}
                className="flex items-center justify-between py-0.5 text-[12.5px]"
              >
                <span className="text-muted-foreground">
                  {PAYMENT_LABELS[method]}
                </span>
                <span className="font-medium tabular-nums text-inkblack">
                  {row?.declared != null ? formatMoney(row.declared) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <Button size="sm" variant="outline" onClick={onGoToPos}>
        Abrir un nuevo turno
      </Button>
    </div>
  );
}
