import { useState } from "react";
import { Check, Wallet } from "lucide-react";
import { Button } from "@/components/shared/Basics/Button";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { JOB_POSITION_LABELS } from "@/utils/generalStatus/job-display";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";
import { useUpdateUserWage } from "@/features/users/hooks/useUsers";
import { usePayrollPaySheet } from "../../hooks/usePayroll";

interface PayrollWagesViewProps {
  locationId: string;
}

function positionsLabel(positions?: JobPositionEnum[] | null): string {
  if (!positions || positions.length === 0) return "";
  return positions.map((p) => JOB_POSITION_LABELS[p] ?? p).join(", ");
}

export function PayrollWagesView({ locationId }: PayrollWagesViewProps) {
  const {
    data: paySheet,
    status: paySheetStatus,
    refetch,
  } = usePayrollPaySheet(locationId);

  const [edited, setEdited] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const { mutate: updateWage, status: updateStatus } = useUpdateUserWage();

  function handleSave(employeeId: string) {
    if (!(employeeId in edited)) return;
    setSavingId(employeeId);
    updateWage(
      { userId: employeeId, locationId, dailyWage: edited[employeeId] },
      {
        onSuccess: () => {
          setEdited((prev) => {
            const next = { ...prev };
            delete next[employeeId];
            return next;
          });
          setSavingId(null);
          refetch();
        },
        onError: () => setSavingId(null),
      },
    );
  }

  if (!locationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px] text-inkblack/40">
          Selecciona una sucursal para gestionar sueldos.
        </p>
      </div>
    );
  }

  if (paySheetStatus === "pending") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current text-muted-foreground/40" />
      </div>
    );
  }

  if (!paySheet || paySheet.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-inkblack/20">
            <Wallet size={20} />
          </div>
          <p className="text-[13px] text-inkblack/40">
            No hay trabajadores activos en esta sucursal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-2">
        {paySheet.map((employee) => {
          const isDirty = employee.employeeId in edited;
          const isSaving =
            updateStatus === "pending" && savingId === employee.employeeId;

          return (
            <div
              key={employee.employeeId}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 rounded-xl border border-surface bg-white px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-inkblack">
                  {employee.employeeName}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {positionsLabel(employee.positions) || "Sin cargo"}
                </p>
              </div>

              <MoneyInput
                className="h-9 w-28 rounded-xl bg-white text-[13px]"
                defaultValue={employee.dailyWage ?? undefined}
                onChange={(value) =>
                  setEdited((prev) => ({
                    ...prev,
                    [employee.employeeId]: value,
                  }))
                }
                placeholder="Sin definir"
              />

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!isDirty || isSaving}
                isLoading={isSaving}
                onClick={() => handleSave(employee.employeeId)}
              >
                <Check size={13} />
                Guardar
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
