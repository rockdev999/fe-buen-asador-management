import { UserCheck, Users, UsersRound } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { usePayrollSummaryReport } from "../../hooks/useReports";
import {
  Delta,
  KpiCard,
  KpiGrid,
  ReportEmpty,
  ReportError,
  ReportLoading,
  ReportSection,
  ReportTabProps,
} from "./ReportBlocks";

export function PayrollReportTab({ params, previous, compareLabel }: ReportTabProps) {
  const { data: report, previous: prev, status, error, isFetching, refetch } =
    usePayrollSummaryReport(params, previous);

  if (status === "pending" && !report) return <ReportLoading cards={3} />;
  if (status === "error") return <ReportError error={error} onRetry={() => refetch()} />;
  if (!report) return null;

  // Ya viene de mayor a menor monto.
  const employees = report.byEmployee;
  const share = (n: number) => (report.totalPayroll > 0 ? (n / report.totalPayroll) * 100 : 0);

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", isFetching && "opacity-60")}>
      <KpiGrid cols={3}>
        <KpiCard
          primary
          label="Total pagado en nómina"
          value={formatMoney(report.totalPayroll)}
          icon={Users}
          delta={
            <Delta
              current={report.totalPayroll}
              previous={prev?.totalPayroll}
              goodWhen="neutral"
              label={compareLabel}
            />
          }
        />
        <KpiCard label="Pagos realizados" value={report.paymentsCount} icon={UserCheck} />
        <KpiCard
          label="Empleados pagados"
          value={employees.length}
          icon={UsersRound}
          hint={
            employees.length > 0
              ? `${formatMoney(report.totalPayroll / employees.length)} por empleado en promedio`
              : undefined
          }
        />
      </KpiGrid>

      <ReportSection title="Nómina por empleado" subtitle="De mayor a menor monto">
        {employees.length === 0 ? (
          <ReportEmpty />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full min-w-[560px] text-[12px]">
              <thead>
                <tr className="border-b border-surface text-left text-[11px] text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Empleado</th>
                  <th className="px-4 py-2 font-medium">Cargo</th>
                  <th className="px-4 py-2 font-medium text-right">Pagos</th>
                  <th className="px-4 py-2 font-medium text-right">Total</th>
                  <th className="px-4 py-2 font-medium w-[140px]">% de la nómina</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e, i) => (
                  <tr
                    key={`${e.employeeName}-${i}`}
                    className="border-b border-surface last:border-0 hover:bg-surface/40"
                  >
                    <td className="px-4 py-2.5 font-medium text-inkblack">{e.employeeName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.roleDescription ?? "-"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{e.paymentsCount}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-inkblack tabular-nums">
                      {formatMoney(e.totalAmount)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-surface overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${share(e.totalAmount)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-[11px] text-muted-foreground tabular-nums">
                          {share(e.totalAmount).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>
    </div>
  );
}
