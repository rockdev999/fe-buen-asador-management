import { Bike, Building2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/OrderBadges";
import { OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { WhatsappOrder } from "../../models/whatsapp-order.model";
import { getOrderActions } from "../../utils/order-actions";
import { WaitTime } from "./WaitTime";
import { PaymentChip } from "./PaymentChip";

interface WhatsappOrderRowProps {
  order: WhatsappOrder;
  now: number;
  canChangeStatus: boolean;
  canCharge: boolean;
  showLocation: boolean;
  /** Estado que se está enviando para este pedido, si hay uno. */
  pendingStatus: OrderStatusEnum | null;
  isSelected: boolean;
  onOpen: () => void;
  onAdvance: (status: OrderStatusEnum) => void;
  onCancel: () => void;
  onCharge: () => void;
}

/** Fila compacta de la bandeja; el detalle completo se ve en el drawer. */
export function WhatsappOrderRow({
  order,
  now,
  canChangeStatus,
  canCharge,
  showLocation,
  pendingStatus,
  isSelected,
  onOpen,
  onAdvance,
  onCancel,
  onCharge,
}: WhatsappOrderRowProps) {
  const isDelivery = order.type === OrderTypeEnum.DELIVERY;
  const actions = getOrderActions(order, { canChangeStatus, canCharge });
  const isBusy = pendingStatus !== null;
  // Los botones de la fila no deben abrir el drawer
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <tr
      onClick={onOpen}
      className={cn(
        "cursor-pointer border-b border-surface text-xs transition-colors last:border-b-0 hover:bg-orange-50/40",
        isSelected && "bg-orange-50/60",
      )}
    >
      <td className="px-4 py-3">
        <p className="font-mono text-sm font-semibold text-inkblack">#{order.shortId}</p>
        {order.status !== OrderStatusEnum.PENDING && (
          <div className="mt-1">
            <StatusBadge status={order.status} />
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <WaitTime order={order} now={now} />
      </td>
      <td className="max-w-[220px] px-3 py-3">
        <p className="truncate font-medium text-inkblack">
          {order.customerName ?? <span className="italic text-muted-foreground">Sin nombre</span>}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {order.customerPhone ?? `+${order.waPhone}`}
        </p>
        {showLocation && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Building2 size={10} className="text-brand" />
            {order.locationName}
          </p>
        )}
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-inkblack">
          {isDelivery ? (
            <Bike size={13} className="text-blue-600" />
          ) : (
            <ShoppingBag size={13} className="text-green-600" />
          )}
          {isDelivery ? "Delivery" : "Recojo"}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold tabular-nums text-inkblack">
        {formatMoney(order.total)}
      </td>
      <td className="px-3 py-3">
        <PaymentChip preference={order.paymentPreference} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1.5">
          {actions.isReject && actions.canCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={stop(onCancel)}
              className="h-7 px-2.5 text-[11px] text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Rechazar
            </Button>
          )}
          {actions.next && (
            <Button
              type="button"
              disabled={isBusy}
              loading={pendingStatus === actions.next.status}
              onClick={stop(() => onAdvance(actions.next!.status))}
              className={cn(
                "h-7 min-w-[84px] px-3 text-[11px] font-medium text-white",
                actions.isReject
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-inkblack hover:bg-inkblack/90",
              )}
            >
              {actions.next.label}
            </Button>
          )}
          {actions.canCharge && (
            <Button
              type="button"
              disabled={isBusy}
              onClick={stop(onCharge)}
              className="h-7 px-3 text-[11px] font-medium text-white bg-brand hover:bg-brand-dark"
            >
              Cobrar
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
