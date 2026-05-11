import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";
import type { OrderSnapshot } from "../../models/order-snapshot";
import { Input } from "@/components/ui/input";
import { useCartStore } from "../../stores/cart.store";
import { t } from "@/locales/es";
import { OrderTypeEnum } from "@/constants";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { Textarea } from "@/components/ui/textarea";
import { Modifier } from "@dnd-kit/core";

const trans = t.pos;

interface ReviewOrderModalProps {
  order: OrderSnapshot;
  onUpdateCustomerDetails: (
    name: string,
    phone: string,
    address: string,
    reference: string,
  ) => void;
  onRemoveItem: (productId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function ReviewOrderModal({
  order,
  onRemoveItem,
  onClose,
  onConfirm,
  isLoading,
}: ReviewOrderModalProps) {
  const {
    customerName,
    customerPhone,
    customerAddress,
    deliveryReference,
    setCustomer,
    setCustomerPhone,
    setCustomerAddress,
    setDeliveryReference,
  } = useCartStore();

  const isDelivery = order.orderType === OrderTypeEnum.DELIVERY;
  const isTakeaway = order.orderType === OrderTypeEnum.TAKEAWAY;

  const isValid = isDelivery
    ? !!(
        customerName?.trim() &&
        customerPhone?.trim() &&
        customerAddress?.trim()
      )
    : isTakeaway
      ? !!customerName?.trim()
      : true;

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

  return (
    <div className="h-full absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50 p-6">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "75vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface flex-shrink-0 overflow-hidden">
          <div>
            <h2 className="text-lg font-medium text-inkblack">
              Revisar pedido
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Verifica los detalles antes de confirmar el cobro
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
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId)}
                        className="w-5 h-5 rounded border border-surface flex items-center justify-center text-destructive hover:text-white hover:bg-destructive hover:border-destructive transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {(item.units.length > 0
                    ? item.units
                    : Array(item.quantity).fill(null)
                  ).map((unit, idx) => {
                    const hasMods = unit && unit.modifiers.length > 0;
                    const unitPrice = getUnitPrice(item, idx);
                    return unit.hasModifiers || unit.notes ? (
                      <div className="px-3 py-1 divide-y divide-surface/60">
                        <div
                          key={unit?.unitId ?? idx}
                          className="flex items-center gap-2 py-1.5"
                        >
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
                                {unit.modifiers
                                  .map((m: Modifier) => m.name)
                                  .join(", ")}
                              </p>
                            )}
                            {unit?.notes && (
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

              {/* Hint delivery incompleto */}
              {(isDelivery || isTakeaway) && !isValid && (
                <p className="w-full text-[12px] text-destructive mt-2 text-center leading-tight">
                  Completa todos los campos
                </p>
              )}
              <div className="flex flex-col gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full h-8 text-md"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={!isValid}
                  loading={isLoading}
                  onClick={onConfirm}
                  className="w-full h-9 bg-brand hover:bg-brand-dark text-white font-medium text-md disabled:opacity-50"
                >
                  Confirmar →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
