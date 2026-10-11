import { ColumnDef } from "@/components/shared/DataTable/types";
import { PayrollPageItem } from "../models/payroll.model";
import { formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { DATA_TABLE } from "@/constants";

export const PAYROLL_TABLE_CONFIG = DATA_TABLE.PAYROLL;

export const PAYROLL_COLUMNS: ColumnDef<PayrollPageItem>[] = [
  {
    key: "employeeName",
    label: "Empleado",
    render: (row) => (
      <span className="text-xs text-inkblack line-clamp-1">
        {row.employeeName}
      </span>
    ),
  },
  {
    key: "roleDescription",
    label: "Cargo",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.roleDescription ?? "—"}
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

const PAYROLL_LOCATION_COLUMN: ColumnDef<PayrollPageItem> = {
  key: "location",
  label: "Sucursal",
  render: (row) => (
    <span className="text-xs text-muted-foreground">
      {row.location.name}
    </span>
  ),
};

// MANAGER viendo "todas las sucursales" necesita la columna de sucursal
// para distinguir las filas; ADMIN/CASHIER, que solo ven la suya, no.
export function getPayrollColumns(
  showLocation: boolean,
): ColumnDef<PayrollPageItem>[] {
  if (!showLocation) return PAYROLL_COLUMNS;

  const withoutCreatedAt = PAYROLL_COLUMNS.filter(
    (col) => col.key !== "createdAt",
  );
  const createdAtColumn = PAYROLL_COLUMNS.find(
    (col) => col.key === "createdAt",
  )!;

  return [...withoutCreatedAt, PAYROLL_LOCATION_COLUMN, createdAtColumn];
}
