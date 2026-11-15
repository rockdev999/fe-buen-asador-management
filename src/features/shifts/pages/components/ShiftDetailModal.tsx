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
import { PAYMENT_LABELS } from "@/utils/generalStatus/sale-display";
import {
  differenceLabel,
  differenceTone,
} from "@/utils/generalStatus/shift-display";
import { ShiftStatusBadge } from "../../components/ShiftStatusBadge";
import { SummaryStat } from "../../components/SummaryStat";

const NOTES_MAX = 500;

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

  const hasDifference = !!shift?.difference && shift.difference !== 0;
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
              <h3 className="mb-2 text-[12px] font-semibold text-inkblack">
                Arqueo
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SummaryStat
                  label="Monto inicial"
                  value={formatMoney(shift.initialAmount)}
                />
                <SummaryStat
                  label="Esperado (sistema)"
                  value={
                    shift.systemAmount !== null
                      ? formatMoney(shift.systemAmount)
                      : summary?.expectedCash != null
                        ? formatMoney(summary.expectedCash)
                        : "—"
                  }
                  hint={shift.systemAmount === null ? "Al momento" : undefined}
                />
                <SummaryStat
                  label="Declarado"
                  value={
                    shift.declaredAmount !== null
                      ? formatMoney(shift.declaredAmount)
                      : "—"
                  }
                />
                <SummaryStat
                  label="Diferencia"
                  value={
                    <span className={differenceTone(shift.difference)}>
                      {shift.difference !== null
                        ? formatMoney(shift.difference)
                        : "—"}
                    </span>
                  }
                  hint={differenceLabel(shift.difference)}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Apertura {formatLocalDateTime(shift.openedAt)}
                {shift.closedAt &&
                  ` · Cierre ${formatLocalDateTime(shift.closedAt)}`}
              </p>
            </section>

            {summary && (
              <section>
                <h3 className="mb-2 text-[12px] font-semibold text-inkblack">
                  Movimientos
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    PaymentMethodEnum.CASH,
                    PaymentMethodEnum.QR,
                    PaymentMethodEnum.BANK_TRANSFER,
                  ].map((method) => {
                    const row = summary.sales.byPaymentMethod.find(
                      (m) => m.method === method,
                    );
                    return (
                      <SummaryStat
                        key={method}
                        label={`Ventas ${PAYMENT_LABELS[method]}`}
                        value={formatMoney(row?.total ?? 0)}
                        hint={`${row?.count ?? 0} ventas`}
                      />
                    );
                  })}
                  <SummaryStat
                    label="Anuladas"
                    value={formatMoney(summary.sales.annulled.total)}
                    hint={`${summary.sales.annulled.count} ventas`}
                  />
                  <SummaryStat
                    label="Egresos"
                    value={formatMoney(summary.expenses.total)}
                    hint={`${summary.expenses.count} registros`}
                  />
                  <SummaryStat
                    label="Nómina"
                    value={formatMoney(summary.payroll.total)}
                    hint={`${summary.payroll.count} pagos`}
                  />
                  <SummaryStat
                    label="Total vendido"
                    value={formatMoney(summary.sales.total)}
                    hint={`${summary.sales.count} ventas`}
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

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className={cn("rounded-xl border border-surface bg-surface/40 px-3.5 py-2.5")}>
      <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
      <p className="mt-0.5 whitespace-pre-line text-[12.5px] text-inkblack">
        {body}
      </p>
    </div>
  );
}
