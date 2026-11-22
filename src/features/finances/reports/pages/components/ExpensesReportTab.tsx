import { Link } from "react-router-dom";
import { ArrowRight, Crown, Receipt, Wallet } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { PATHS } from "@/routes/paths";
import { expenseCategoryLabel } from "@/features/finances/expenses/pages/ExpenseColumns";
import { useExpensesSummaryReport } from "../../hooks/useReports";
import {
  Delta,
  HorizontalBar,
  KpiCard,
  KpiGrid,
  ReportEmpty,
  ReportError,
  ReportLoading,
  ReportNote,
  ReportSection,
  ReportTabProps,
} from "./ReportBlocks";

export function ExpensesReportTab({ params, previous, compareLabel }: ReportTabProps) {
  const { data: report, previous: prev, status, error, isFetching, refetch } =
    useExpensesSummaryReport(params, previous);

  if (status === "pending" && !report) return <ReportLoading cards={3} />;
  if (status === "error") return <ReportError error={error} onRetry={() => refetch()} />;
  if (!report) return null;

  // Ya viene de mayor a menor y solo con categorías que tienen gastos.
  const categories = report.byCategory;
  const max = Math.max(...categories.map((c) => c.total), 1);
  const pct = (total: number) =>
    report.totalExpenses > 0 ? (total / report.totalExpenses) * 100 : 0;
  const top = categories[0];
  const average = report.expensesCount > 0 ? report.totalExpenses / report.expensesCount : 0;

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", isFetching && "opacity-60")}>
      <KpiGrid cols={3}>
        <KpiCard
          primary
          label="Total gastado"
          value={formatMoney(report.totalExpenses)}
          icon={Wallet}
          hint="Incluye los pagos de nómina"
          delta={
            <Delta
              current={report.totalExpenses}
              previous={prev?.totalExpenses}
              goodWhen="down"
              label={compareLabel}
            />
          }
        />
        <KpiCard
          label="Gastos registrados"
          value={report.expensesCount}
          icon={Receipt}
          hint={report.expensesCount > 0 ? `${formatMoney(average)} en promedio` : undefined}
        />
        <KpiCard
          label="Categoría con más gasto"
          value={top ? expenseCategoryLabel(top.categoryName) : "—"}
          icon={Crown}
          hint={top ? `${formatMoney(top.total)} · ${pct(top.total).toFixed(1)}% del total` : undefined}
        />
      </KpiGrid>

      <ReportSection
        title="Gastos por categoría"
        subtitle="Porcentaje sobre el total gastado"
        aside={
          <Link
            to={PATHS.EXPENSES}
            className="flex items-center gap-1 text-[12px] font-medium text-brand hover:underline whitespace-nowrap"
          >
            Ver cada gasto <ArrowRight size={12} />
          </Link>
        }
      >
        {categories.length === 0 ? (
          <ReportEmpty />
        ) : (
          <div className="flex flex-col gap-4">
            {categories.map((c) => (
              <HorizontalBar
                key={c.categoryId}
                label={expenseCategoryLabel(c.categoryName)}
                value={`${pct(c.total).toFixed(1)}%`}
                detail={`${formatMoney(c.total)} · ${c.count} ${c.count === 1 ? "gasto" : "gastos"}`}
                ratio={c.total / max}
              />
            ))}
            <ReportNote>
              Los pagos de nómina se registran como gasto de la categoría
              Personal. El detalle de cada gasto está en el PDF o en Egresos.
            </ReportNote>
          </div>
        )}
      </ReportSection>
    </div>
  );
}
