import { X, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";
import type { OrderSnapshot } from "../../models/order-snapshot";
import { Input } from "@/components/ui/input";
import { useCartStore } from "../../stores/cart.store";
import { t } from "@/locales/es";
import { OrderStatusEnum, OrderTypeEnum } from "@/constants";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateOrderStatus } from "../../hooks/useOrder";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/OrderBadges";

const trans = t.pos;

// Transiciones que permite PUT /orders/:id/status (ver OrdersService del BE).
// POST /sales solo acepta pedidos READY, así que cada estado intermedio
// necesita su paso manual para que el turno pueda cerrarse.
const NEXT_STATUS: Partial<
  Record<OrderStatusEnum, { status: OrderStatusEnum; label: string }>
> = {
  [OrderStatusEnum.PENDING]: {
    status: OrderStatusEnum.READY,
    label: "Marcar como listo",
  },
  [OrderStatusEnum.CONFIRMED]: {
    status: OrderStatusEnum.PREPARING,
    label: "Pasar a preparación",
  },
  [OrderStatusEnum.PREPARING]: {
    status: OrderStatusEnum.READY,
    label: "Marcar como listo",
  },
  // Cobro del delivery sin control de caja: se marca pagado a mano.
  [OrderStatusEnum.DELIVERED]: {
    status: OrderStatusEnum.PAID,
    label: "Marcar como pagado",
  },
};

const CANCEL_REASON_MAX = 500;

const CANCELLABLE_STATUSES = [
  OrderStatusEnum.PENDING,
  OrderStatusEnum.CONFIRMED,
  OrderStatusEnum.PREPARING,
  OrderStatusEnum.READY,
];

interface ReviewOrderModalProps {
  order: OrderSnapshot;
  orderId?: string;
  onRemoveItem: (productId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  onOrderCancelled?: () => void;
  isLoading: boolean;
  /** POST /sales es solo del CASHIER: el admin no ve el botón de cobrar. */
  canCharge?: boolean;
}

export function ReviewOrderModal({
  order,
  orderId,
  onRemoveItem,
  onClose,
  onConfirm,
  onOrderCancelled,
  isLoading,
  canCharge = true,
}: ReviewOrderModalProps) {
  const cart = useCartStore();
  const {
    setCustomer,
    setCustomerPhone,
    setCustomerAddress,
    setDeliveryReference,
  } = useCartStore();

  // Cancelar exige motivo (PUT /orders/:id/status con `reason`).
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [confirmAdvance, setConfirmAdvance] = useState(false);
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateOrderStatus();
  const [pendingStatus, setPendingStatus] = useState<OrderStatusEnum | null>(
    null,
  );

  const isDelivery = order.orderType === OrderTypeEnum.DELIVERY;
  const isTakeaway = order.orderType === OrderTypeEnum.TAKEAWAY;
  const isExistingOrder = !!orderId;

  // Pedido existente: se muestran sus datos (solo lectura). Pedido nuevo del
  // POS: los campos editan el carrito.
  const customerName = isExistingOrder ? order.customerName : cart.customerName;
  const customerPhone = isExistingOrder
    ? order.customerPhone
    : cart.customerPhone;
  const customerAddress = isExistingOrder
    ? order.customerAddress
    : cart.customerAddress;
  const deliveryReference = isExistingOrder
    ? order.deliveryReference
    : cart.deliveryReference;

  const isValid = isExistingOrder
    ? true
    : isDelivery
      ? !!(
          customerName?.trim() &&
          customerPhone?.trim() &&
          customerAddress?.trim()
        )
      : isTakeaway
        ? !!customerName?.trim()
        : true;

  const status = order.status;
  const nextStep = isExistingOrder && status ? NEXT_STATUS[status] : undefined;
  const canCancel =
    isExistingOrder && !!status && CANCELLABLE_STATUSES.includes(status);
  const showCharge = isExistingOrder
    ? status === OrderStatusEnum.READY && canCharge
    : true;
  const isFinal =
    status === OrderStatusEnum.PAID || status === OrderStatusEnum.CANCELLED;

  function getItemTotal(item: OrderSnapshot["items"][0]): number {
    if (item.units.length > 0) {
      return item.units.reduce((sum, unit) => {
        const modExtra = unit.modifiers.reduce((s, m) => s + m.extraPrice, 0);
        return sum + item.price + modExtra;
      }, 0);
    }
    return item.price * item.quantity;
  }

  function getUnitPrice(
    item: OrderSnapshot["items"][0],
    unitIdx: number,
  ): number {
    const unit = item.units[unitIdx];
    if (!unit) return item.price;
    const modExtra = unit.modifiers.reduce((s, m) => s + m.extraPrice, 0);
    return item.price + modExtra;
  }

  const subtotal = order.items.reduce((s, item) => s + getItemTotal(item), 0);

  const trimmedReason = cancelReason.trim();

  function handleCancel() {
    if (!orderId || !trimmedReason) return;
    setPendingStatus(OrderStatusEnum.CANCELLED);
    updateStatus(
      {
        id: orderId,
        status: OrderStatusEnum.CANCELLED,
        reason: trimmedReason,
      },
      {
        onSuccess: () => {
          onOrderCancelled?.();
          onClose();
        },
        onSettled: () => setPendingStatus(null),
      },
    );
  }

  // Avanza al siguiente estado. Marcar como pagado pide doble clic porque
  // cierra el pedido sin pasar por caja.
  function handleAdvance() {
    if (!orderId || !nextStep) return;
    const needsConfirm = nextStep.status === OrderStatusEnum.PAID;
    if (needsConfirm && !confirmAdvance) {
      setConfirmAdvance(true);
      setTimeout(() => setConfirmAdvance(false), 2500);
      return;
    }
    setConfirmAdvance(false);
    setPendingStatus(nextStep.status);
    updateStatus(
      { id: orderId, status: nextStep.status },
      {
        // El detalle se refresca solo (invalida ["orders"]); si queda en un
        // estado final ya no hay nada que hacer en el modal.
        onSuccess: () => {
          if (nextStep.status === OrderStatusEnum.PAID) onClose();
        },
        onSettled: () => setPendingStatus(null),
      },
    );
  }

  const isDisabled = isExistingOrder || status === OrderStatusEnum.CANCELLED;

  return (
    <div className="h-full absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50 p-6">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "75vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface flex-shrink-0 overflow-hidden">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-inkblack">
                {isExistingOrder ? "Pedido" : "Revisar pedido"}
              </h2>
              {isExistingOrder && status && <StatusBadge status={status} />}
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {isExistingOrder
                ? "Detalle del pedido y acciones disponibles"
                : "Verifica los detalles antes de confirmar el cobro"}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={cn(
                  "text-[14px] font-medium px-3 py-1 rounded bg-success text-white border border-green-200",
                )}
              >
                {trans.enum.orderType[order.orderType]}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded border border-surface flex items-center justify-center text-muted-foreground hover:border-brand hover:text-brand transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Cliente editable */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden border-r border-surface">
            <div className="px-4 pt-2.5 pb-2 flex-shrink-0">
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                Detalle del pedido
              </p>
            </div>
            {/* Items */}
            <div className="flex-1 w-full h-full overflow-y-auto px-4 pt-1 mb-3 flex flex-col gap-2">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="border border-surface rounded-lg"
                >
                  {/* Item header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-surface">
                    <span className="text-xs font-medium text-inkblack">
                      {item.units.length || item.quantity} {item.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs font-medium text-brand">
                        {formatMoney(getItemTotal(item))}
                      </span>
                      {!isDisabled && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId)}
                          className="w-5 h-5 rounded border border-surface flex items-center justify-center text-destructive hover:text-white hover:bg-destructive hover:border-destructive transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {item.units.map((unit, idx) => {
                    const hasMods = unit.modifiers.length > 0;
                    const unitPrice = getUnitPrice(item, idx);
                    return hasMods || unit.notes ? (
                      <div
                        key={unit.unitId ?? idx}
                        className="px-3 py-1 divide-y divide-surface/60"
                      >
                        <div className="flex items-center gap-2 py-1.5">
                          {hasMods && (
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                hasMods
                                  ? "bg-brand-light"
                                  : "bg-muted-foreground/20",
                              )}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            {hasMods && (
                              <p className="text-[11px] text-brand-light">
                                {unit.modifiers.map((m) => m.name).join(", ")}
                              </p>
                            )}
                            {unit.notes && (
                              <p className="text-[11px] text-muted-foreground italic mt-0.5">
                                "{unit.notes}"
                              </p>
                            )}
                          </div>
                          {hasMods && (
                            <span className="text-[11px] text-muted-foreground flex-shrink-0">
                              {formatMoney(unitPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — resumen + botones */}
          <div className="w-[40%] flex flex-col justify-between flex-shrink-0 p-4 overflow-y-auto">
            <div>
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Resumen
              </p>
              {/* <div className="px-0 py-2 border-b border-surface flex-shrink-0"> */}
              <div className={cn("grid gap-2 grid-cols-1")}>
                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <Label
                    className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                    important={isDelivery || isTakeaway}
                  >
                    Nombre
                  </Label>
                  <Input
                    disabled={isDisabled}
                    value={customerName ?? ""}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="h-7 text-xs"
                  />
                </div>

                {/* Campos delivery */}
                {isDelivery && (
                  <div className="flex flex-col gap-2">
                    <FormField className="">
                      <Label
                        className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                        important
                      >
                        Teléfono
                      </Label>
                      <Input
                        disabled={isDisabled}
                        value={customerPhone ?? ""}
                        onChange={(e) => {
                          if (/^[0-9\-+() ]*$/.test(e.target.value))
                            setCustomerPhone(e.target.value);
                        }}
                        maxLength={8}
                        placeholder="Ej: 777-123-45"
                        className={cn(
                          "h-7 text-xs",
                          !customerPhone?.trim() && "border-destructive/40",
                        )}
                      />
                    </FormField>
                    <FormField className="">
                      <Label
                        className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                        important
                      >
                        Dirección
                      </Label>
                      <Textarea
                        disabled={isDisabled}
                        value={customerAddress ?? ""}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Ej: Av. Siempre Viva #123"
                        className={cn(
                          "text-xs",
                          !customerAddress?.trim() && "border-destructive/40",
                        )}
                      />
                    </FormField>
                    <FormField className="">
                      <Label
                        className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                        important
                      >
                        Referencia
                      </Label>
                      <Input
                        disabled={isDisabled}
                        value={deliveryReference ?? ""}
                        onChange={(e) => setDeliveryReference(e.target.value)}
                        placeholder="Ej: Casa roja junto al parque"
                        className="h-7 text-xs"
                      />
                    </FormField>
                  </div>
                )}
              </div>
              {/* </div> */}
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="border-t border-surface mt-2 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-inkblack">
                    Subtotal
                  </span>
                  <span className="text-lg font-medium text-brand">
                    {formatMoney(subtotal)}
                  </span>
                </div>
              </div>

              {(isDelivery || isTakeaway) && !isValid && (
                <p className="w-full text-[12px] text-destructive mt-2 text-center leading-tight">
                  Completa todos los campos
                </p>
              )}
              {isFinal ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  <p className="text-center text-[12px] text-muted-foreground">
                    {status === OrderStatusEnum.PAID
                      ? "Este pedido ya fue pagado."
                      : "Este pedido fue cancelado."}
                  </p>
                  {status === OrderStatusEnum.CANCELLED && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-red-700/70">
                        Motivo
                      </p>
                      <p className="mt-0.5 whitespace-pre-line text-[12px] text-red-800">
                        {order.cancellationReason ?? "Sin motivo registrado"}
                      </p>
                    </div>
                  )}
                </div>
              ) : isCancelling ? (
                <div className="mt-2 flex flex-col gap-2">
                  <FormField>
                    <Label
                      className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                      important
                    >
                      Motivo de cancelación
                    </Label>
                    <Textarea
                      autoFocus
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      maxLength={CANCEL_REASON_MAX}
                      placeholder="Ej: El cliente se fue sin esperar"
                      className="text-xs"
                      rows={3}
                    />
                    <p className="text-right text-[10px] text-muted-foreground">
                      {cancelReason.length}/{CANCEL_REASON_MAX}
                    </p>
                  </FormField>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={!trimmedReason || isUpdatingStatus}
                    loading={pendingStatus === OrderStatusEnum.CANCELLED}
                    className="w-full h-9 bg-red-500 hover:bg-red-600 text-white font-medium text-md disabled:opacity-50"
                  >
                    Confirmar cancelación
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCancelling(false);
                      setCancelReason("");
                    }}
                    disabled={isUpdatingStatus}
                    className="w-full h-8 text-md"
                  >
                    Volver
                  </Button>
                </div>
              ) : (
                <>
                  {canCancel && (
                    <Button
                      type="button"
                      onClick={() => setIsCancelling(true)}
                      disabled={isUpdatingStatus}
                      className="w-full h-8 text-md font-medium border flex items-center justify-center gap-1.5 transition-all bg-white border-surface text-muted-foreground hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                    >
                      <AlertCircle size={12} />
                      Cancelar pedido
                    </Button>
                  )}

                  <div className="flex flex-col gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="w-full h-8 text-md"
                    >
                      {isExistingOrder ? "Cerrar" : "Cancelar"}
                    </Button>
                    {nextStep && (
                      <Button
                        type="button"
                        onClick={handleAdvance}
                        disabled={isUpdatingStatus}
                        loading={pendingStatus === nextStep.status}
                        className={cn(
                          "w-full h-9 font-medium text-md",
                          confirmAdvance
                            ? "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100"
                            : "bg-inkblack text-white hover:bg-inkblack/90",
                        )}
                      >
                        {confirmAdvance
                          ? "¿Confirmar? No entra en la caja"
                          : nextStep.label}
                      </Button>
                    )}
                    {showCharge && (
                      <Button
                        type="button"
                        disabled={!isValid || isUpdatingStatus}
                        loading={isLoading}
                        onClick={onConfirm}
                        className="w-full h-9 bg-brand hover:bg-brand-dark text-white font-medium text-md disabled:opacity-50"
                      >
                        {isExistingOrder ? "Cobrar →" : "Confirmar →"}
                      </Button>
                    )}
                    {isExistingOrder &&
                      status === OrderStatusEnum.READY &&
                      !canCharge && (
                        <p className="text-center text-[11px] text-muted-foreground">
                          El cobro lo registra el cajero desde su turno.
                        </p>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
