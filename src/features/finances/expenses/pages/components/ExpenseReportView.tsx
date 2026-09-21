import { PieChart, Receipt, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { ExpensesReport } from "../../models/expense.model";
import { expenseCategoryLabel } from "../ExpenseColumns";

interface ExpenseReportViewProps {
  report: ExpensesReport | null;
  isLoading: boolean;
  emptyMessage: string;
}

export function ExpenseReportView({
  report,
  isLoading,
  emptyMessage,
}: ExpenseReportViewProps) {
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

  const maxTotal = Math.max(...report.byCategory.map((c) => c.total), 1);
  const sortedCategories = [...report.byCategory].sort(
    (a, b) => b.total - a.total,
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
              Total de egresos
            </p>
            <p className="text-lg font-semibold text-inkblack tabular-nums">
              {formatMoney(report.totalExpenses)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-surface bg-white p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Receipt size={17} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Cantidad de egresos
            </p>
            <p className="text-lg font-semibold text-inkblack tabular-nums">
              {report.expensesCount}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-surface bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Desglose por categoría
        </p>

        {sortedCategories.length === 0 ? (
          <p className="text-[12px] text-muted-foreground/60 py-4 text-center">
            No hay egresos registrados en este período.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedCategories.map((category) => (
              <div key={category.categoryId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-inkblack">
                    {expenseCategoryLabel(category.categoryName)}
                  </span>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {formatMoney(category.total)} · {category.count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-300"
                    style={{
                      width: `${(category.total / maxTotal) * 100}%`,
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
