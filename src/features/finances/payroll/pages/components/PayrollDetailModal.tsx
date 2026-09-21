import { Building2, Receipt, UserCheck, UserCircle2 } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { useGetPayrollById } from "../../hooks/usePayroll";

interface PayrollDetailModalProps {
  payrollId: string;
  onClose: () => void;
}

export const PayrollDetailModal = ({
  payrollId,
  onClose,
}: PayrollDetailModalProps) => {
  const { data: payment, status: paymentStatus } =
    useGetPayrollById(payrollId);

  const isLoading = paymentStatus === "pending";

  return (
    <AppModal size="md" maxHeightClassName="max-h-[85vh]">
      <PanelHeader
        icon={UserCheck}
        title="Detalle del pago de nómina"
        onClose={onClose}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current text-muted-foreground/40" />
        </div>
      ) : (
        payment && (
          <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Empleado
                </p>
                <p className="text-[13px] font-medium text-inkblack">
                  {payment.employeeName}
                </p>
                {payment.roleDescription && (
                  <p className="text-[11px] text-muted-foreground">
                    {payment.roleDescription}
                  </p>
                )}
              </div>

              <div className="col-span-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Monto
                </p>
                <p className="text-lg font-semibold text-brand tabular-nums">
                  {formatMoney(payment.amount)}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                <Building2 size={13} className="text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Sucursal
                  </p>
                  <p className="text-[12px] text-inkblack truncate">
                    {payment.location.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                <UserCircle2 size={13} className="text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Registrado por
                  </p>
                  <p className="text-[12px] text-inkblack truncate">
                    {payment.registeredBy.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                <Receipt size={13} className="text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Gasto generado
                  </p>
                  <p className="text-[12px] text-inkblack truncate">
                    {formatMoney(payment.expense.amount)}
                  </p>
                </div>
              </div>

              {payment.audit.createdAt && (
                <div className="col-span-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Fecha de registro
                  </p>
                  <p className="text-[12px] text-inkblack">
                    {formatLocalDateTime(payment.audit.createdAt)}
                  </p>
                </div>
              )}

              {payment.notes && (
                <div className="col-span-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Notas
                  </p>
                  <p className="text-[12px] text-inkblack">{payment.notes}</p>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </AppModal>
  );
};
