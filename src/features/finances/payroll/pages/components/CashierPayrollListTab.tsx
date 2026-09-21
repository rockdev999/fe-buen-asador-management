import { useState } from "react";
import { Plus, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/shared/Basics/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useActiveShift } from "@/features/pos/hooks/useShift";
import { formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { usePayrollList } from "../../hooks/usePayroll";
import { CreatePayrollModal } from "./CreatePayrollModal";
import { BatchPayrollModal } from "./BatchPayrollModal";

export function CashierPayrollListTab() {
  const { user } = useAuth();
  const locationId = user?.locationId ?? "";

  const { data: shift, isOpen: hasActiveShift } = useActiveShift();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openBatchModal, setOpenBatchModal] = useState(false);

  const {
    data: payments,
    status: paymentsStatus,
    refetch,
  } = usePayrollList({
    locationId,
    shiftId: shift?.id ?? "",
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-surface bg-white flex-shrink-0">
        <p className="text-[12px] text-muted-foreground">
          Pagos registrados en tu turno actual
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenBatchModal(true)}
            disabled={!hasActiveShift}
            title={
              hasActiveShift
                ? undefined
                : "Necesitas un turno abierto para pagar sueldos"
            }
          >
            <Users size={13} />
            Pagar sueldos
          </Button>
          <Button
            size="sm"
            onClick={() => setOpenCreateModal(true)}
            disabled={!hasActiveShift}
            title={
              hasActiveShift
                ? undefined
                : "Necesitas un turno abierto para registrar un pago"
            }
          >
            <Plus size={13} />
            Registrar pago
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!hasActiveShift ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <p className="text-[13px] text-inkblack/40 text-center max-w-xs mx-auto">
              Necesitas abrir un turno de caja para registrar y ver pagos de
              nómina.
            </p>
          </div>
        ) : paymentsStatus === "pending" ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current text-muted-foreground/40" />
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-inkblack/20">
              <UserCheck size={20} />
            </div>
            <p className="text-[13px] text-inkblack/40">
              No hay pagos de nómina en este turno.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-surface bg-white px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-inkblack truncate">
                    {payment.employeeName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {payment.roleDescription ?? "Sin cargo"}
                    {payment.audit.createdAt &&
                      ` · ${formatLocalDateTime(payment.audit.createdAt)}`}
                  </p>
                </div>
                <span className="text-[13px] font-semibold tabular-nums text-brand shrink-0">
                  {formatMoney(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {openCreateModal && (
        <CreatePayrollModal
          onClose={() => setOpenCreateModal(false)}
          onSuccess={() => {
            setOpenCreateModal(false);
            refetch();
          }}
        />
      )}

      {openBatchModal && (
        <BatchPayrollModal
          locationId={locationId}
          onClose={() => setOpenBatchModal(false)}
          onSuccess={() => {
            setOpenBatchModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
