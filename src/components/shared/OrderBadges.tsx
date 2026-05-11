import { OrderEnum, OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { cn } from "@/lib/utils";
import {
  ORDER_CHANNEL_COLORS,
  ORDER_CHANNEL_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_COLORS,
  ORDER_TYPE_LABELS,
} from "@/utils/generalStatus/order-display";

export function StatusBadge({ status }: { status: OrderStatusEnum }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium",
        ORDER_STATUS_COLORS[status] ?? "bg-surface text-muted-foreground",
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function TypeBadge({ type }: { type: OrderTypeEnum }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium",
        ORDER_TYPE_COLORS[type] ?? "bg-surface text-muted-foreground",
      )}
    >
      {ORDER_TYPE_LABELS[type] ?? type}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: OrderEnum }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <span style={{ color: ORDER_CHANNEL_COLORS[channel] }}>
        {ORDER_CHANNEL_LABELS[channel] ?? channel}
      </span>
    </span>
  );
}
