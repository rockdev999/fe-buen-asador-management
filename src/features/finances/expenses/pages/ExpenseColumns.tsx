import { Lock } from "lucide-react";
import { ColumnDef } from "@/components/shared/DataTable/types";
import { ExpensePageItem } from "../models/expense.model";
import { cn, formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { DATA_TABLE, ExpenseCategoryEnum } from "@/constants";
import { t } from "@/locales/es";

export const EXPENSES_TABLE_CONFIG = DATA_TABLE.EXPENSES;

const CATEGORY_LABELS = t.finances.expense.categories as Record<string, string>;

export function expenseCategoryLabel(name: string): string {
  return CATEGORY_LABELS[name] ?? name;
}

// Gastos generados automáticamente al registrar un pago de nómina — el
// backend los rechaza si se intenta editar/eliminar, así que el FE los
// muestra como solo lectura en vez de dejar que el usuario tope con el error.
export function isPayrollGeneratedExpense(row: {
  category: { name: string };
  description: string;
}): boolean {
  return (
    row.category.name === ExpenseCategoryEnum.PERSONNEL &&
    row.description.startsWith("Pago de nómina -")
  );
}

const CATEGORY_STYLES: Record<string, string> = {
  [ExpenseCategoryEnum.SERVICES]: "bg-blue-50 text-blue-600",
  [ExpenseCategoryEnum.PERSONNEL]: "bg-purple-50 text-purple-600",
  [ExpenseCategoryEnum.SUPPLIES]: "bg-emerald-50 text-emerald-600",
  [ExpenseCategoryEnum.MAINTENANCE]: "bg-amber-50 text-amber-600",
  [ExpenseCategoryEnum.OTHER]: "bg-surface text-muted-foreground",
};

export const EXPENSES_COLUMNS: ColumnDef<ExpensePageItem>[] = [
  {
    key: "description",
    label: "Descripción",
    render: (row) => (
      <span
        className="flex items-center gap-1.5 text-xs text-inkblack line-clamp-1"
        title={
          isPayrollGeneratedExpense(row)
            ? "Generado automáticamente por un pago de nómina — no se puede editar"
            : undefined
        }
      >
        {isPayrollGeneratedExpense(row) && (
          <Lock
            size={11}
            className="shrink-0 text-muted-foreground"
            aria-label="Generado automáticamente"
          />
        )}
        {row.description}
      </span>
    ),
  },
  {
    key: "category",
    label: "Categoría",
    render: (row) => (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
          CATEGORY_STYLES[row.category.name] ??
            "bg-surface text-muted-foreground",
        )}
      >
        {expenseCategoryLabel(row.category.name)}
      </span>
    ),
  },
  {
    key: "amount",
    label: "Monto",
    render: (row) => (
      <span className="text-xs font-semibold tabular-nums text-brand">
        {formatMoney(row.amount)}
      </span>
    ),
  },
  {
    key: "registeredBy",
    label: "Registrado por",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.registeredBy.name}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Fecha",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {formatLocalDateTime(row.createdAt)}
      </span>
    ),
  },
];
