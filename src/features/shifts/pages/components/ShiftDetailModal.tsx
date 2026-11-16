import { useFormik } from "formik";
import { Archive } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { FormTextarea } from "@/components/shared/Form/FormTextarea";
import { PaymentMethodEnum, ShiftStatusEnum } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import {
  useApproveShift,
  useShiftById,
  useShiftSummaryById,
} from "@/features/pos/hooks/useShift";
import { ShiftApproveForm } from "@/features/pos/forms/shift.form";
import { Shift, ShiftSummary } from "@/features/pos/models/shift";
import { PAYMENT_LABELS } from "@/utils/generalStatus/sale-display";
import { differenceTone } from "@/utils/generalStatus/shift-display";
import { ShiftStatusBadge } from "../../components/ShiftStatusBadge";
import { SummaryStat } from "../../components/SummaryStat";

const NOTES_MAX = 500;

const PAYMENT_METHODS = [
  PaymentMethodEnum.CASH,
  PaymentMethodEnum.QR,
  PaymentMethodEnum.BANK_TRANSFER,
];

const money = (value: number | null | undefined) =>
  value == null ? "—" : formatMoney(value);

interface ShiftDetailModalProps {
  shiftId: string;
  /** Solo el ADMIN aprueba cierres (de su sucursal). */
  canApprove: boolean;
  onClose: () => void;
  onApproved: () => void;
}

export function ShiftDetailModal({
  shiftId,
  canApprove,
  onClose,
  onApproved,
}: ShiftDetailModalProps) {
  const { data: shift, status: shiftStatus } = useShiftById(shiftId);
  const { data: summary } = useShiftSummaryById(shiftId);
  const { mutate: approve, status: approveStatus } = useApproveShift();

  // El backend exige comentario si cualquier método no cuadra.
  const hasDifference = shift?.hasDifference === true;
  const showApprove = canApprove && shift?.status === ShiftStatusEnum.PENDING;

  const formik = useFormik<ShiftApproveForm>({
    initialValues: { notes: "" },
    validate: (values) => {
      const errors: Partial<Record<keyof ShiftApproveForm, string>> = {};
      if (hasDifference && !values.notes.trim()) {
        errors.notes =
          "El cierre tiene diferencia. Deja un comentario para aprobarlo.";
      } else if (values.notes.length > NOTES_MAX) {
        errors.notes = `Máximo ${NOTES_MAX} caracteres`;
      }
      return errors;
    },
    onSubmit: (values) => {
      const notes = values.notes.trim();
      approve(
        { id: shiftId, dto: notes ? { notes } : {} },
        { onSuccess: onApproved },
      );
    },
  });

  return (
    <AppModal size="xl" maxHeightClassName="max-h-[88vh]">
      <PanelHeader
        icon={Archive}
        title="Turno de caja"
        description={
          shift
            ? `${shift.cashier.name} · ${shift.location.name}`
            : "Cargando..."
        }
        actions={shift && <ShiftStatusBadge status={shift.status} />}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {shiftStatus === "pending" || !shift ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current text-muted-foreground/40" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <section>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[12px] font-semibold text-inkblack">
                  Arqueo
                </h3>
                {shift.hasDifference !== null && (
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-medium",
                      shift.hasDifference
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-700",
                    )}
                  >
                    {shift.hasDifference ? "Con diferencia" : "Cuadra"}
                  </span>
                )}
              </div>

              <div className="mb-2 grid grid-cols-2 gap-2">
                <SummaryStat
                  label="Monto inicial (efectivo)"
                  value={formatMoney(shift.initialAmount)}
                />
                <SummaryStat
                  label="Horario"
                  value={
                    <span className="text-[12.5px] font-medium">
                      {formatLocalDateTime(shift.openedAt)}
                    </span>
                  }
                  hint={
                    shift.closedAt
                      ? `Cierre ${formatLocalDateTime(shift.closedAt)}`
                      : "Turno en curso"
                  }
                />
              </div>

              <ReconciliationTable shift={shift} summary={summary} />
            </section>

            {summary && (
              <section>
                <h3 className="mb-2 text-[12px] font-semibold text-inkblack">
                  Movimientos
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PAYMENT_METHODS.map((method) => {
                    const row = summary.sales.byPaymentMethod.find(
                      (m) => m.method === method,
                    );
                    return (
                      <SummaryStat
                        key={method}
                        label={`Ventas ${PAYMENT_LABELS[method]}`}
                        value={money(row?.total)}
                        hint={`${row?.count ?? 0} ventas`}
                      />
                    );
                  })}
                  <SummaryStat
                    label="Total vendido"
                    value={money(summary.sales.total)}
                    hint={`${summary.sales.count} ventas`}
                  />
                  <SummaryStat
                    label="Anuladas"
                    value={money(summary.sales.annulled.total)}
                    hint={`${summary.sales.annulled.count} ventas`}
                  />
                  <SummaryStat
                    label="Egresos"
                    value={money(summary.expenses.total)}
                    hint={`${summary.expenses.count} registros`}
                  />
                  <SummaryStat
                    label="Nómina"
                    value={money(summary.payroll.total)}
                    hint={`${summary.payroll.count} pagos`}
                  />
                  {shift.status === ShiftStatusEnum.OPEN && (
                    <SummaryStat
                      label="Pedidos pendientes"
                      value={summary.pendingOrders}
                    />
                  )}
                </div>
              </section>
            )}

            {(shift.notes || shift.review) && (
              <section className="flex flex-col gap-2">
                {shift.notes && (
                  <Note title="Nota del cajero" body={shift.notes} />
                )}
                {shift.review && (
                  <Note
                    title={`Aprobado por ${shift.review.reviewedBy.name} · ${formatLocalDateTime(shift.review.reviewedAt)}`}
                    body={shift.review.notes ?? "Sin comentario"}
                  />
                )}
              </section>
            )}

            {showApprove && (
              <form id="approve-shift-form" onSubmit={formik.handleSubmit}>
                <FormTextarea
                  id="notes"
                  name="notes"
                  label="Comentario de aprobación"
                  required={hasDifference}
                  placeholder={
                    hasDifference
                      ? "Explica cómo se resolvió la diferencia"
                      : "Opcional"
                  }
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.notes}
                  error={formik.errors.notes}
                  maxLength={NOTES_MAX}
                  showCounter
                  rows={3}
                />
              </form>
            )}
          </div>
        )}
      </div>

      <PanelFooter align="right">
        <Button type="button" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        {showApprove && (
          <Button
            type="submit"
            form="approve-shift-form"
            isLoading={approveStatus === "pending"}
            loadingText="Aprobando..."
          >
            Aprobar cierre
          </Button>
        )}
      </PanelFooter>
    </AppModal>
  );
}

/**
 * Declarado vs esperado por método. Con el turno OPEN no hay arqueo todavía:
 * se muestra el esperado al momento (efectivo desde expectedCash; QR y
 * tarjeta, lo vendido por ese medio).
 */
function ReconciliationTable({
  shift,
  summary,
}: {
  shift: Shift;
  summary: ShiftSummary | null;
}) {
  const rows = PAYMENT_METHODS.map((method) => {
    const closed = shift.reconciliation?.find((r) => r.method === method);
    if (closed) return closed;
    const sold = summary?.sales.byPaymentMethod.find(
      (m) => m.method === method,
    );
    return {
      method,
      declared: null,
      expected:
        method === PaymentMethodEnum.CASH
          ? (summary?.expectedCash ?? null)
          : (sold?.total ?? null),
      difference: null,
    };
  });

  return (
    <div className="overflow-hidden rounded-xl border border-surface">
      <table className="w-full text-[12px]">
        <thead className="bg-surface/50 text-[11px] text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Método</th>
            <th className="px-3 py-2 text-right font-medium">Declarado</th>
            <th className="px-3 py-2 text-right font-medium">
              {shift.reconciliation ? "Esperado" : "Esperado al momento"}
            </th>
            <th className="px-3 py-2 text-right font-medium">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.method} className="border-t border-surface">
              <td className="px-3 py-2 text-inkblack">
                {PAYMENT_LABELS[row.method]}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-inkblack">
                {money(row.declared)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                {money(row.expected)}
              </td>
              <td
                className={cn(
                  "px-3 py-2 text-right font-semibold tabular-nums",
                  differenceTone(row.difference),
                )}
              >
                {money(row.difference)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shift.reconciliation?.some(
        (r) => r.method !== PaymentMethodEnum.CASH && r.declared === null,
      ) && (
        <p className="border-t border-surface px-3 py-2 text-[10.5px] text-muted-foreground">
          Turno anterior al arqueo por método: solo se arqueó el efectivo.
        </p>
      )}
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-surface bg-surface/40 px-3.5 py-2.5">
      <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
      <p className="mt-0.5 whitespace-pre-line text-[12.5px] text-inkblack">
        {body}
      </p>
    </div>
  );
}
