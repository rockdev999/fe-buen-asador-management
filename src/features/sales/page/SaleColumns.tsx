import { Building2 } from "lucide-react";
import { ColumnDef } from "@/components/shared/DataTable/types";
import { ManagerSalePageItem, SalePageItem } from "../models/sale";
import { cn, formatMoney } from "@/lib/utils";
import {
  PAYMENT_LABELS,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/utils/generalStatus/sale-display";
import { DATA_TABLE, SaleStatusEnum } from "@/constants";
import { formatLocalDateTime } from "@/lib/formatters";

export const SALES_TABLE_CONFIG = DATA_TABLE.SALES;

export const SALES_COLUMNS: ColumnDef<SalePageItem>[] = [
  {
    key: "ticketCode",
    label: "Ticket",
    render: (row) => (
      <span className="text-xs font-mono font-medium text-inkblack">
        {row.ticketCode}
      </span>
    ),
  },
  {
    key: "customerName",
    label: "Cliente",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-inkblack">
        {row.customerName ?? (
          <span className="text-muted-foreground italic">--</span>
        )}
      </span>
    ),
  },
  {
    key: "status",
    label: "Estado",
    sortable: true,
    render: (row) => (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
          STATUS_STYLES[row.status] ?? "bg-surface text-muted-foreground",
        )}
      >
        {STATUS_LABELS[row.status] ?? row.status}
      </span>
    ),
  },
  {
    key: "paymentMethod",
    label: "Método",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.paymentMethod
          ? (PAYMENT_LABELS[row.paymentMethod] ?? row.paymentMethod)
          : "--"}
      </span>
    ),
  },
  {
    key: "cashier",
    label: "Cajero",
    render: (row) => (
      <span className="text-xs text-muted-foreground">{row.cashier.name}</span>
    ),
  },
  {
    key: "total",
    label: "Total",
    sortable: true,
    render: (row) => (
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          row.status === SaleStatusEnum.ANNULLED
            ? "text-muted-foreground line-through"
            : "text-brand",
        )}
      >
        {formatMoney(row.total)}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Fecha",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {formatLocalDateTime(row.createdAt)}
      </span>
    ),
  },
];

// Orden por prioridad para la vista global de MANAGER: primero lo accionable
// (estado, cliente, sucursal, cajero), luego el pago y al final el ticket,
// que es solo una referencia interna.
export const MANAGER_SALES_COLUMNS: ColumnDef<ManagerSalePageItem>[] = [
  {
    key: "status",
    label: "Estado",
    sortable: true,
    render: (row) => (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
          STATUS_STYLES[row.status] ?? "bg-surface text-muted-foreground",
        )}
      >
        {STATUS_LABELS[row.status] ?? row.status}
      </span>
    ),
  },
  {
    key: "customerName",
    label: "Cliente",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-inkblack">
        {row.customerName ?? (
          <span className="text-muted-foreground italic">--</span>
        )}
      </span>
    ),
  },
  {
    key: "locationName",
    label: "Sucursal",
    sortable: false,
    render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-xs text-inkblack">
        <Building2 size={12} className="text-brand flex-shrink-0" />
        {row.locationName}
      </span>
    ),
  },
  {
    key: "cashier",
    label: "Cajero",
    sortable: false,
    render: (row) => (
      <span className="text-xs text-muted-foreground">{row.cashier.name}</span>
    ),
  },
  {
    key: "paymentMethod",
    label: "Método",
    sortable: false,
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.paymentMethod
          ? (PAYMENT_LABELS[row.paymentMethod] ?? row.paymentMethod)
          : "--"}
      </span>
    ),
  },
  {
    key: "total",
    label: "Total",
    sortable: true,
    render: (row) => (
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          row.status === SaleStatusEnum.ANNULLED
            ? "text-muted-foreground line-through"
            : "text-brand",
        )}
      >
        {formatMoney(row.total)}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Fecha",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {formatLocalDateTime(row.createdAt)}
      </span>
    ),
  },
  {
    key: "ticketCode",
    label: "Ticket",
    sortable: false,
    render: (row) => (
      <span className="text-xs font-mono font-medium text-inkblack/50">
        {row.ticketCode}
      </span>
    ),
  },
];
