import { Receipt, UserCheck, Wallet, Users } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { expenseCategoryLabel } from "@/features/finances/expenses/pages/ExpenseColumns";
import { ReportParams } from "../../dto/report.dto";
import {
  useExpensesSummaryReport,
  usePayrollSummaryReport,
} from "../../hooks/useReports";
import {
  HorizontalBar,
  ReportEmpty,
  ReportError,
  ReportLoading,
  ReportSection,
  StatCard,
} from "./ReportBlocks";

export function ExpensesPayrollReportTab({ params }: { params: ReportParams }) {
  return (
    <div className="flex flex-col gap-4">
      <ExpensesBlock params={params} />
      <PayrollBlock params={params} />
    </div>
  );
}

function ExpensesBlock({ params }: { params: ReportParams }) {
  const { data: report, status, error } = useExpensesSummaryReport(params);

  if (status === "pending" && !report) return <ReportLoading />;
  if (status === "error") return <ReportError error={error} />;
  if (!report) return null;

  const categories = [...report.byCategory].sort((a, b) => b.total - a.total);
  const max = Math.max(...categories.map((c) => c.total), 1);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          label="Total de egresos"
          value={formatMoney(report.totalExpenses)}
          icon={Wallet}
        />
        <StatCard
          label="Cantidad de egresos"
          value={report.expensesCount}
          icon={Receipt}
        />
      </div>

      <ReportSection title="Egresos por categoría">
        {categories.length === 0 || report.expensesCount === 0 ? (
          <ReportEmpty message="No hubo egresos en este período" />
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <HorizontalBar
                key={c.categoryId}
                label={expenseCategoryLabel(c.categoryName)}
                detail={`${formatMoney(c.total)} · ${c.count}`}
                ratio={c.total / max}
              />
            ))}
          </div>
        )}
      </ReportSection>
    </>
  );
}

function PayrollBlock({ params }: { params: ReportParams }) {
  const { data: report, status, error } = usePayrollSummaryReport(params);

  if (status === "pending" && !report) return <ReportLoading />;
  if (status === "error") return <ReportError error={error} />;
  if (!report) return null;

  const employees = [...report.byEmployee].sort(
    (a, b) => b.totalAmount - a.totalAmount,
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          label="Total de nómina"
          value={formatMoney(report.totalPayroll)}
          icon={Users}
        />
        <StatCard
          label="Cantidad de pagos"
          value={report.paymentsCount}
          icon={UserCheck}
        />
      </div>

      <ReportSection title="Nómina por empleado">
        {employees.length === 0 ? (
          <ReportEmpty message="No hubo pagos de nómina en este período" />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-surface text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 font-semibold">Empleado</th>
                  <th className="px-4 py-2 font-semibold">Cargo</th>
                  <th className="px-4 py-2 font-semibold text-right">Pagos</th>
                  <th className="px-4 py-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e, i) => (
                  <tr
                    key={`${e.employeeName}-${i}`}
                    className="border-b border-surface last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium text-inkblack">
                      {e.employeeName}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {e.roleDescription ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {e.paymentsCount}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-inkblack tabular-nums">
                      {formatMoney(e.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>
    </>
  );
}
