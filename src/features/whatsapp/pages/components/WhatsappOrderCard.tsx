import {
  AlertTriangle,
  Banknote,
  Bike,
  Building2,
  Clock,
  MapPin,
  Phone,
  QrCode,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/OrderBadges";
import { OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { WhatsappPaymentPreferenceEnum } from "../../dto/whatsapp-order.dto";
import { WhatsappOrder } from "../../models/whatsapp-order.model";

/** Siguiente paso que dispara cada estado (ver tabla de transiciones del BE). */
const NEXT_STEP: Partial<
  Record<OrderStatusEnum, { status: OrderStatusEnum; label: string }>
> = {
  // PENDING → READY también es válido en el backend, pero se obliga a
  // aprobar: esa transición es la que envía la confirmación y el QR.
  [OrderStatusEnum.PENDING]: { status: OrderStatusEnum.CONFIRMED, label: "Aprobar" },
  [OrderStatusEnum.CONFIRMED]: { status: OrderStatusEnum.PREPARING, label: "Preparar" },
  [OrderStatusEnum.PREPARING]: { status: OrderStatusEnum.READY, label: "Listo" },
};

// Cobro: POST /sales acepta READY y DELIVERED (delivery con pago al entregar).
const CHARGEABLE: OrderStatusEnum[] = [OrderStatusEnum.READY, OrderStatusEnum.DELIVERED];

const CANCELLABLE: OrderStatusEnum[] = [
  OrderStatusEnum.PENDING,
  OrderStatusEnum.CONFIRMED,
  OrderStatusEnum.PREPARING,
  OrderStatusEnum.READY,
];

const URL_RE = /https?:\/\/\S+/gi;

function splitAddress(address: string) {
  const links = address.match(URL_RE) ?? [];
  const text = address.replace(URL_RE, "").replace(/\s{2,}/g, " ").trim();
  return { text, links };
}

function formatWait(createdAt: string | null, now: number) {
  if (!createdAt) return { label: "--", minutes: 0 };
  const minutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000));
  if (minutes < 1) return { label: "recién", minutes };
  if (minutes < 60) return { label: `${minutes} min`, minutes };
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return { label: m ? `${h} h ${m} min` : `${h} h`, minutes };
}

interface WhatsappOrderCardProps {
  order: WhatsappOrder;
  now: number;
  /** CASHIER y ADMIN cambian estados; MANAGER solo mira. */
  canChangeStatus: boolean;
  /** POST /sales es solo del CASHIER. */
  canCharge: boolean;
  showLocation: boolean;
  /** Estado que se está enviando para este pedido, si hay uno. */
  pendingStatus: OrderStatusEnum | null;
  onAdvance: (status: OrderStatusEnum) => void;
  onCancel: () => void;
  onCharge: () => void;
}

export function WhatsappOrderCard({
  order,
  now,
  canChangeStatus,
  canCharge,
  showLocation,
  pendingStatus,
  onAdvance,
  onCancel,
  onCharge,
}: WhatsappOrderCardProps) {
  const isDelivery = order.type === OrderTypeEnum.DELIVERY;
  const isPending = order.status === OrderStatusEnum.PENDING;
  const isChargeable = CHARGEABLE.includes(order.status);
  const isQr = order.paymentPreference === WhatsappPaymentPreferenceEnum.QR;
  const wait = formatWait(order.createdAt, now);
  // Delivery: READY → DELIVERED cuando sale el repartidor (se cobra igual).
  const next =
    isDelivery && order.status === OrderStatusEnum.READY
      ? { status: OrderStatusEnum.DELIVERED, label: "Entregado" }
      : NEXT_STEP[order.status];
  const canCancel = canChangeStatus && CANCELLABLE.includes(order.status);
  const isBusy = pendingStatus !== null;
  const address = order.deliveryAddress ? splitAddress(order.deliveryAddress) : null;

  return (
    <article
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border bg-white p-3.5 shadow-sm",
        isPending ? "border-yellow-300" : "border-surface",
      )}
    >
      {/* Encabezado: código · estado · espera */}
      <header className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-inkblack">
          #{order.shortId}
        </span>
        <StatusBadge status={order.status} />
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-[11px] tabular-nums",
            isPending && wait.minutes >= 20
              ? "font-semibold text-red-600"
              : isPending && wait.minutes >= 10
                ? "font-medium text-amber-600"
                : "text-muted-foreground",
          )}
          title="Tiempo desde que llegó el pedido"
        >
          <Clock size={11} />
          {wait.label}
        </span>
      </header>

      {showLocation && (
        <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Building2 size={11} className="text-brand" />
          {order.locationName}
        </p>
      )}

      {/* Cliente */}
      <div className="flex flex-col gap-1 text-xs text-inkblack">
        <p className="inline-flex items-center gap-1.5">
          <User size={12} className="text-muted-foreground" />
          {order.customerName ?? <span className="italic text-muted-foreground">Sin nombre</span>}
        </p>
        <a
          href={`https://wa.me/${order.waPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-green-700 hover:underline"
        >
          <Phone size={12} />
          {order.customerPhone ?? `+${order.waPhone}`}
        </a>
      </div>

      {/* Tipo y entrega */}
      <div className="flex flex-col gap-1 rounded-lg bg-surface/50 px-2.5 py-2 text-xs">
        <p className="inline-flex items-center gap-1.5 font-medium text-inkblack">
          {isDelivery ? <Bike size={13} className="text-blue-600" /> : <ShoppingBag size={13} className="text-green-600" />}
          {isDelivery ? "Delivery" : "Recojo en sucursal"}
        </p>
        {isDelivery && address && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin size={12} className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              {address.text && <p className="break-words">{address.text}</p>}
              {address.links.map((href) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Ver en mapa
                </a>
              ))}
            </div>
          </div>
        )}
        {isDelivery && order.deliveryReference && (
          <p className="pl-[18px] italic text-muted-foreground">
            Ref.: {order.deliveryReference}
          </p>
        )}
      </div>

      {/* Ítems */}
      <ul className="flex flex-col gap-1 text-xs">
        {order.lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-2">
            <div className="min-w-0">
              <p className="text-inkblack">
                <span className="font-semibold">{line.quantity} ×</span> {line.name}
              </p>
              {line.modifiers.length > 0 && (
                <p className="text-[11px] text-brand-light">{line.modifiers.join(", ")}</p>
              )}
              {line.notes && (
                <p className="text-[11px] italic text-muted-foreground">"{line.notes}"</p>
              )}
            </div>
            <span className="flex-shrink-0 tabular-nums text-muted-foreground">
              {formatMoney(line.total)}
            </span>
          </li>
        ))}
      </ul>

      {/* Total y pago */}
      <div className="flex items-center justify-between border-t border-surface pt-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
            isQr ? "bg-purple-50 text-purple-700" : "bg-green-50 text-green-700",
          )}
        >
          {isQr ? <QrCode size={12} /> : <Banknote size={12} />}
          {isQr ? "QR" : "Efectivo"}
        </span>
        <span className="text-base font-semibold tabular-nums text-inkblack">
          {formatMoney(order.total)}
        </span>
      </div>

      {isPending && canChangeStatus && (
        <p className="inline-flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          <AlertTriangle size={12} className="mt-px flex-shrink-0" />
          El bot no valida stock: confirma que hay todo antes de aprobar.
        </p>
      )}

      {/* Acciones */}
      {canChangeStatus && (next || canCancel || (isChargeable && canCharge)) && (
        <div className="flex gap-2">
          {canCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={onCancel}
              className="h-8 px-3 text-xs text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              {isPending ? "Rechazar" : "Cancelar"}
            </Button>
          )}
          {next && (
            <Button
              type="button"
              disabled={isBusy}
              loading={pendingStatus === next.status}
              onClick={() => onAdvance(next.status)}
              className={cn(
                "h-8 flex-1 text-xs font-medium text-white",
                isPending ? "bg-green-600 hover:bg-green-700" : "bg-inkblack hover:bg-inkblack/90",
              )}
            >
              {next.label}
            </Button>
          )}
          {isChargeable && canCharge && (
            <Button
              type="button"
              disabled={isBusy}
              onClick={onCharge}
              className="h-8 flex-1 bg-brand text-xs font-medium text-white hover:bg-brand-dark"
            >
              Cobrar →
            </Button>
          )}
        </div>
      )}
      {isChargeable && canChangeStatus && !canCharge && (
        <p className="text-center text-[11px] text-muted-foreground">
          El cobro lo registra el cajero desde su turno.
        </p>
      )}
    </article>
  );
}
