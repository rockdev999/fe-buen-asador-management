import { PieChart, UserCheck, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { PayrollReport } from "../../models/payroll.model";

interface PayrollReportViewProps {
  report: PayrollReport | null;
  isLoading: boolean;
  emptyMessage: string;
}

export function PayrollReportView({
  report,
  isLoading,
  emptyMessage,
}: PayrollReportViewProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          <span className="text-[12px]">Generando reporte...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-inkblack/20">
            <PieChart size={20} />
          </div>
          <p className="text-[13px] text-inkblack/40">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...report.byEmployee.map((e) => e.totalAmount), 1);
  const sortedEmployees = [...report.byEmployee].sort(
    (a, b) => b.totalAmount - a.totalAmount,
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-surface bg-white p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Wallet size={17} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total de nómina
            </p>
            <p className="text-lg font-semibold text-inkblack tabular-nums">
              {formatMoney(report.totalPayroll)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-surface bg-white p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <UserCheck size={17} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Cantidad de pagos
            </p>
            <p className="text-lg font-semibold text-inkblack tabular-nums">
              {report.paymentsCount}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-surface bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Desglose por empleado
        </p>

        {sortedEmployees.length === 0 ? (
          <p className="text-[12px] text-muted-foreground/60 py-4 text-center">
            No hay pagos de nómina registrados en este período.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedEmployees.map((employee, index) => (
              <div key={`${employee.employeeName}-${index}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-inkblack">
                    {employee.employeeName}
                    {employee.roleDescription && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {employee.roleDescription}
                      </span>
                    )}
                  </span>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {formatMoney(employee.totalAmount)} ·{" "}
                    {employee.paymentsCount}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-300"
                    style={{
                      width: `${(employee.totalAmount / maxTotal) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
