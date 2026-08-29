import { Building2 } from "lucide-react";
import { ColumnDef } from "@/components/shared/DataTable/types";
import {
  DATA_TABLE,
  OrderEnum,
  OrderStatusEnum,
  OrderTypeEnum,
} from "@/constants";
import { formatMoney } from "@/lib/utils";

import { ManagerOrderPageItem, OrderPageItem } from "../../models/order";
import {
  ChannelBadge,
  StatusBadge,
  TypeBadge,
} from "@/components/shared/OrderBadges";
import { formatLocalDateTime } from "@/lib/formatters";

export const ORDERS_TABLE_CONFIG = DATA_TABLE.ORDERS;

export const ORDERS_COLUMNS: ColumnDef<OrderPageItem>[] = [
  {
    key: "id",
    label: "Pedido",
    // width: "120px",
    render: (row) => (
      <span className="text-xs font-medium text-inkblack font-mono">
        #{row.id.slice(-8).toUpperCase()}
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
    key: "type",
    label: "Tipo",
    // width: "120px",
    sortable: true,
    render: (row) => <TypeBadge type={row.type as OrderTypeEnum} />,
  },
  {
    key: "channel",
    label: "Canal",
    // width: "100px",
    sortable: true,
    render: (row) => <ChannelBadge channel={row.channel as OrderEnum} />,
  },
  {
    key: "status",
    label: "Estado",
    sortable: true,
    // width: "120px",
    render: (row) => <StatusBadge status={row.status as OrderStatusEnum} />,
  },
  {
    key: "subtotal",
    label: "Subtotal",
    sortable: false,
    // width: "100px",
    render: (row) => (
      <span className="text-xs font-medium text-brand">
        {formatMoney(row.subtotal)}
      </span>
    ),
  },
  {
    key: "updatedAt",
    label: "Fecha",
    sortable: true,
    // width: "140px",
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.updatedAt ? formatLocalDateTime(row.updatedAt) : "--"}
      </span>
    ),
  },
];

// Orden por prioridad para la vista global de MANAGER: primero lo accionable
// (estado, cliente, sucursal), luego el contexto del pedido y al final el ID,
// que es solo una referencia interna.
export const MANAGER_ORDERS_COLUMNS: ColumnDef<ManagerOrderPageItem>[] = [
  {
    key: "status",
    label: "Estado",
    sortable: true,
    render: (row) => <StatusBadge status={row.status as OrderStatusEnum} />,
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
    key: "type",
    label: "Tipo",
    sortable: true,
    render: (row) => <TypeBadge type={row.type as OrderTypeEnum} />,
  },
  {
    key: "channel",
    label: "Canal",
    sortable: true,
    render: (row) => <ChannelBadge channel={row.channel as OrderEnum} />,
  },
  {
    key: "subtotal",
    label: "Subtotal",
    sortable: false,
    render: (row) => (
      <span className="text-xs font-medium text-brand">
        {formatMoney(row.subtotal)}
      </span>
    ),
  },
  {
    key: "updatedAt",
    label: "Fecha",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.updatedAt ? formatLocalDateTime(row.updatedAt) : "--"}
      </span>
    ),
  },
  {
    key: "id",
    label: "Pedido",
    sortable: false,
    render: (row) => (
      <span className="text-xs font-medium text-inkblack/50 font-mono">
        #{row.id.slice(-8).toUpperCase()}
      </span>
    ),
  },
];
