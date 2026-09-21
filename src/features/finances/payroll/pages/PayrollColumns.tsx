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
