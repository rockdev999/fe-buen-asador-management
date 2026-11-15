import { ColumnDef } from "@/components/shared/DataTable/types";
import { DATA_TABLE } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { Shift } from "@/features/pos/models/shift";
import { differenceTone } from "@/utils/generalStatus/shift-display";
import { ShiftStatusBadge } from "../components/ShiftStatusBadge";

export const SHIFTS_TABLE_CONFIG = DATA_TABLE.SHIFTS;

const money = (value: number | null) => (value === null ? "—" : formatMoney(value));

const BASE_COLUMNS: ColumnDef<Shift>[] = [
  {
    key: "status",
    label: "Estado",
    render: (row) => <ShiftStatusBadge status={row.status} />,
  },
  {
    key: "cashier",
    label: "Cajero",
    render: (row) => (
      <span className="text-xs text-inkblack line-clamp-1">
        {row.cashier.name}
      </span>
    ),
  },
  {
    key: "openedAt",
    label: "Apertura",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {formatLocalDateTime(row.openedAt)}
      </span>
    ),
  },
  {
    key: "closedAt",
    label: "Cierre",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.closedAt ? formatLocalDateTime(row.closedAt) : "—"}
      </span>
    ),
  },
  {
    key: "declaredAmount",
    label: "Declarado",
    render: (row) => (
      <span className="text-xs tabular-nums text-inkblack">
        {money(row.declaredAmount)}
      </span>
    ),
  },
  {
    key: "systemAmount",
    label: "Sistema",
    render: (row) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {money(row.systemAmount)}
      </span>
    ),
  },
  {
    key: "difference",
    label: "Diferencia",
    render: (row) => (
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          differenceTone(row.difference),
        )}
      >
        {money(row.difference)}
      </span>
    ),
  },
];

const LOCATION_COLUMN: ColumnDef<Shift> = {
  key: "location",
  label: "Sucursal",
  render: (row) => (
    <span className="text-xs text-muted-foreground">{row.location.name}</span>
  ),
};

/** El MANAGER ve todas las sucursales, así que necesita la columna Sucursal. */
export function getShiftColumns(showLocation: boolean): ColumnDef<Shift>[] {
  if (!showLocation) return BASE_COLUMNS;
  return [BASE_COLUMNS[0], BASE_COLUMNS[1], LOCATION_COLUMN, ...BASE_COLUMNS.slice(2)];
}
