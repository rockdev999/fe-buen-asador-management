import { MessageCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/OrderBadges";
import { OrderEnum, OrderStatusEnum } from "@/constants";
import { shortOrderId } from "@/lib/order-code";
import { OrderPageItem } from "../../models/order";

/** Código corto (el mismo que recibe el cliente) e ícono si vino por WhatsApp. */
export function OrderCode({ row, muted = false }: { row: OrderPageItem; muted?: boolean }) {
  const isWhatsapp = row.channel === OrderEnum.ONLINE;
  return (
    <span
      className={
        muted
          ? "inline-flex items-center gap-1.5 text-xs font-medium text-inkblack/50 font-mono"
          : "inline-flex items-center gap-1.5 text-xs font-medium text-inkblack font-mono"
      }
    >
      #{shortOrderId(row.id)}
      {isWhatsapp && (
        <span title="Pedido de WhatsApp" className="text-green-600">
          <MessageCircle size={12} aria-label="WhatsApp" />
        </span>
      )}
    </span>
  );
}

/** Estado; si está cancelado, el motivo aparece al pasar el mouse. */
export function OrderStatusCell({ row }: { row: OrderPageItem }) {
  const reason =
    row.status === OrderStatusEnum.CANCELLED ? row.cancellationReason : null;
  return (
    <span title={reason ? `Motivo: ${reason}` : undefined} className={reason ? "cursor-help" : undefined}>
      <StatusBadge status={row.status as OrderStatusEnum} />
    </span>
  );
}
