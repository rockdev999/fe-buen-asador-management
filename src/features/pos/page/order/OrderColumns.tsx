import { ColumnDef } from "@/components/shared/DataTable/types";
import {
  DATA_TABLE,
  OrderEnum,
  OrderStatusEnum,
  OrderTypeEnum,
} from "@/constants";
import { formatMoney } from "@/lib/utils";

import { OrderPageItem } from "../../models/order";
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
