import { useState } from "react";
import { Users } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { cn, formatMoney } from "@/lib/utils";
import { JOB_POSITION_LABELS } from "@/utils/generalStatus/job-display";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";
import { usePayrollPaySheet, useCreatePayrollBatch } from "../../hooks/usePayroll";
import { CreatePayrollDTO } from "../../dto/payroll.dto";

interface BatchPayrollModalProps {
  locationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function positionsLabel(positions?: JobPositionEnum[] | null): string {
  if (!positions || positions.length === 0) return "";
  return positions.map((p) => JOB_POSITION_LABELS[p] ?? p).join(", ");
}

export const BatchPayrollModal = ({
  locationId,
  onClose,
  onSuccess,
}: BatchPayrollModalProps) => {
  const { data: paySheet, status: paySheetStatus } =
    usePayrollPaySheet(locationId);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const { mutate: createBatch, status: createStatus } =
    useCreatePayrollBatch();

  const payments: CreatePayrollDTO[] = (paySheet ?? [])
    .filter((employee) => selected[employee.employeeId] ?? true)
    .map((employee) => ({
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      ...(positionsLabel(employee.positions) && {
        roleDescription: positionsLabel(employee.positions),
      }),
      amount: amounts[employee.employeeId] ?? employee.dailyWage ?? 0,
    }))
    .filter((payment) => payment.amount > 0);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const canSubmit = payments.length > 0 && createStatus !== "pending";

  function toggleSelected(employeeId: string, checked: boolean) {
    setSelected((prev) => ({ ...prev, [employeeId]: checked }));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    createBatch({ payments }, { onSuccess });
  }

  const isLoading = paySheetStatus === "pending";

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[88vh]">
      <PanelHeader
        icon={Users}
        title="Pagar sueldos"
        description="Desmarca a quienes no trabajaron hoy y ajusta el monto si es necesario."
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-5 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current text-muted-foreground/40" />
          </div>
        ) : !paySheet || paySheet.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-inkblack/20">
              <Users size={20} />
            </div>
            <p className="text-[13px] text-inkblack/40">
              No hay trabajadores activos en esta sucursal.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {paySheet.map((employee) => {
              const isChecked = selected[employee.employeeId] ?? true;

              return (
                <div
                  key={employee.employeeId}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-surface bg-white px-3.5 py-2.5 transition-opacity",
                    !isChecked && "opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      toggleSelected(employee.employeeId, e.target.checked)
                    }
                    className="h-4 w-4 shrink-0 rounded border-surface accent-brand"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-medium text-inkblack truncate">
                        {employee.employeeName}
                      </p>
                      {employee.paidToday && (
                        <span
                          className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-medium text-amber-600"
                          title={
                            employee.paidTodayAmount
                              ? `Ya se le pagó ${formatMoney(employee.paidTodayAmount)} hoy`
                              : "Ya se le pagó hoy"
                          }
                        >
                          Ya pagado hoy
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {positionsLabel(employee.positions) || "Sin cargo"}
                    </p>
                  </div>

                  <MoneyInput
                    className="h-9 w-32 rounded-xl bg-white text-[13px]"
                    disabled={!isChecked}
                    defaultValue={employee.dailyWage ?? undefined}
                    onChange={(value) =>
                      setAmounts((prev) => ({
                        ...prev,
                        [employee.employeeId]: value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PanelFooter>
        <p className="text-[12px] text-muted-foreground">
          {payments.length > 0
            ? `${payments.length} trabajador${payments.length === 1 ? "" : "es"} · ${formatMoney(total)}`
            : "Marca al menos un trabajador con monto mayor a 0"}
        </p>
        <div>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={createStatus === "pending"}
          >
            Pagar sueldos
          </Button>
        </div>
      </PanelFooter>
    </AppModal>
  );
};
