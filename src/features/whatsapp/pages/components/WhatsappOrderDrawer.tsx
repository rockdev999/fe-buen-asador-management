import {
  AlertTriangle,
  Bike,
  Building2,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/OrderBadges";
import { AppOffcanvas } from "@/components/shared/Overlay/AppOffcanvas";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { cn, formatMoney } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/formatters";
import { WhatsappOrder } from "../../models/whatsapp-order.model";
import { getOrderActions, splitAddress } from "../../utils/order-actions";
import { WaitTime } from "./WaitTime";
import { PaymentChip } from "./PaymentChip";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </h3>
      {children}
    </section>
  );
}

interface WhatsappOrderDrawerProps {
  order: WhatsappOrder | null;
  now: number;
  canChangeStatus: boolean;
  canCharge: boolean;
  showLocation: boolean;
  pendingStatus: OrderStatusEnum | null;
  onClose: () => void;
  onAdvance: (status: OrderStatusEnum) => void;
  onCancel: () => void;
  onCharge: () => void;
}

/** Detalle completo del pedido con todas sus acciones. */
export function WhatsappOrderDrawer({
  order,
  now,
  canChangeStatus,
  canCharge,
  showLocation,
  pendingStatus,
  onClose,
  onAdvance,
  onCancel,
  onCharge,
}: WhatsappOrderDrawerProps) {
  return (
    <AppOffcanvas open={!!order} onClose={onClose} widthClassName="w-full max-w-[420px]">
      {order && (
        <DrawerBody
          order={order}
          now={now}
          canChangeStatus={canChangeStatus}
          canCharge={canCharge}
          showLocation={showLocation}
          pendingStatus={pendingStatus}
          onClose={onClose}
          onAdvance={onAdvance}
          onCancel={onCancel}
          onCharge={onCharge}
        />
      )}
    </AppOffcanvas>
  );
}

function DrawerBody({
  order,
  now,
  canChangeStatus,
  canCharge,
  showLocation,
  pendingStatus,
  onClose,
  onAdvance,
  onCancel,
  onCharge,
}: WhatsappOrderDrawerProps & { order: WhatsappOrder }) {
  const isDelivery = order.type === OrderTypeEnum.DELIVERY;
  const actions = getOrderActions(order, { canChangeStatus, canCharge });
  const isBusy = pendingStatus !== null;
  const address = order.deliveryAddress ? splitAddress(order.deliveryAddress) : null;
  const unitCount = order.lines.reduce((s, l) => s + l.quantity, 0);
  const hasActions = !!actions.next || actions.canCharge || actions.canCancel;

  return (
    <>
      <PanelHeader
        title={`Pedido #${order.shortId}`}
        description={
          order.createdAt ? `Recibido el ${formatLocalDateTime(order.createdAt)}` : undefined
        }
        icon={MessageCircle}
        onClose={onClose}
      />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <WaitTime order={order} now={now} />
          {showLocation && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Building2 size={11} className="text-brand" />
              {order.locationName}
            </span>
          )}
        </div>

        <Section title="Cliente">
          <p className="inline-flex items-center gap-1.5 font-medium text-inkblack">
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
        </Section>

        <Section title="Entrega">
          <p className="inline-flex items-center gap-1.5 font-medium text-inkblack">
            {isDelivery ? (
              <Bike size={13} className="text-blue-600" />
            ) : (
              <ShoppingBag size={13} className="text-green-600" />
            )}
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
            <p className="pl-[18px] italic text-muted-foreground">Ref.: {order.deliveryReference}</p>
          )}
        </Section>

        <Section title={`Detalle (${unitCount} ${unitCount === 1 ? "ítem" : "ítems"})`}>
          <ul className="flex flex-col divide-y divide-surface rounded-lg border border-surface">
            {order.lines.map((line) => (
              <li key={line.key} className="flex justify-between gap-2 px-3 py-2">
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
        </Section>

        <div className="flex items-center justify-between rounded-lg bg-surface/50 px-3 py-2.5">
          <PaymentChip preference={order.paymentPreference} />
          <span className="text-lg font-semibold tabular-nums text-inkblack">
            {formatMoney(order.total)}
          </span>
        </div>

        {actions.isReject && canChangeStatus && (
          <p className="inline-flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
            <AlertTriangle size={12} className="mt-px flex-shrink-0" />
            El bot no valida stock: confirma que hay todo antes de aprobar.
          </p>
        )}
      </div>

      {(hasActions || actions.chargeByCashierOnly) && (
        <div className="flex flex-col gap-2 border-t border-surface px-5 py-3">
          {actions.chargeByCashierOnly && (
            <p className="text-center text-[11px] text-muted-foreground">
              El cobro lo registra el cajero desde su turno.
            </p>
          )}
          {actions.next && (
            <Button
              type="button"
              disabled={isBusy}
              loading={pendingStatus === actions.next.status}
              onClick={() => onAdvance(actions.next!.status)}
              className={cn(
                "h-9 w-full text-sm font-medium text-white",
                actions.isReject ? "bg-green-600 hover:bg-green-700" : "bg-inkblack hover:bg-inkblack/90",
              )}
            >
              {actions.next.label}
            </Button>
          )}
          {actions.canCharge && (
            <Button
              type="button"
              disabled={isBusy}
              onClick={onCharge}
              className="h-9 w-full bg-brand text-sm font-medium text-white hover:bg-brand-dark"
            >
              Cobrar →
            </Button>
          )}
          {actions.canCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={onCancel}
              className="h-9 w-full text-sm text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              {actions.isReject ? "Rechazar pedido" : "Cancelar pedido"}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
