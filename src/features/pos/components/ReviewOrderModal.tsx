import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { cn, formatMoney } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import type { OrderSnapshot } from "../models/order-snapshot";
import { Input } from "@/components/ui/input";
import { useCartStore } from "../stores/cart.store";
import { t } from "@/locales/es";
import { OrderTypeEnum } from "@/constants";
import { Label } from "@/components/ui/label";

const trans = t.pos;

interface ReviewOrderModalProps {
  order: OrderSnapshot;
  discount: number;
  onUpdateDiscount: (value: number) => void;
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
  discount,
  onUpdateDiscount,
  onUpdateCustomerDetails,
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
    : true;

  // Calcula el total real usando las units con sus modificadores
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
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50 p-6">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface flex-shrink-0">
          <div>
            <h2 className="text-md font-medium text-inkblack">
              Revisar pedido
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Verifica los detalles antes de confirmar el cobro
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded border border-surface flex items-center justify-center text-muted-foreground hover:border-brand hover:text-brand transition-colors"
          >
            <X size={12} />
          </button>
        </div>

        {/* Cliente editable */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden border-r border-surface">
            {/* Cliente */}
            <div className="px-4 py-3 border-b border-surface flex-shrink-0">
              <div className="flex items-center gap-2.5 mb-3">
                {/* <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-brand text-[10px] font-medium">
                    {getInitials(customerName || "CG")}
                  </span>
                </div> */}
                <span
                  className={cn(
                    "text-[12px] font-medium px-2 py-0.5 rounded",
                    isDelivery
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-brand/10 text-brand-dark",
                  )}
                >
                  {trans.enum.orderType[order.orderType]}
                </span>
              </div>

              <div
                className={cn(
                  "grid gap-2",
                  isDelivery ? "grid-cols-2" : "grid-cols-1",
                )}
              >
                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <Label className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                    {(isDelivery || isTakeaway) && (
                      <span className="text-destructive ml-0.5">*</span>
                    )}
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
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                        Teléfono <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={customerPhone ?? ""}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej: 777-123-45"
                        className={cn(
                          "h-7 text-xs",
                          !customerPhone?.trim() && "border-destructive/40",
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                        Dirección <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={customerAddress ?? ""}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Ej: Av. Siempre Viva #123"
                        className={cn(
                          "h-7 text-xs",
                          !customerAddress?.trim() && "border-destructive/40",
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
                        Referencia
                      </label>
                      <Input
                        value={deliveryReference ?? ""}
                        onChange={(e) => setDeliveryReference(e.target.value)}
                        placeholder="Ej: Casa roja junto al parque"
                        className="h-7 text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="border border-surface rounded-lg overflow-hidden"
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

                  {/* Units */}
                  {item.haveModifiers && (
                    <div className="px-3 py-1 divide-y divide-surface/60">
                      {(item.units.length > 0
                        ? item.units
                        : Array(item.quantity).fill(null)
                      ).map((unit, idx) => {
                        const hasMods = unit && unit.modifiers.length > 0;
                        const unitPrice = getUnitPrice(item, idx);
                        return (
                          <div
                            key={unit?.unitId ?? idx}
                            className="flex items-center gap-2 py-1.5"
                          >
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                hasMods
                                  ? "bg-brand-light"
                                  : "bg-muted-foreground/20",
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              {hasMods ? (
                                <p className="text-[9px] text-brand-light">
                                  {unit.modifiers
                                    .map((m: any) => m.name)
                                    .join(", ")}
                                </p>
                              ) : (
                                <p className="text-[9px] text-muted-foreground italic">
                                  Sin modificadores
                                </p>
                              )}
                              {unit?.notes && (
                                <p className="text-[9px] text-muted-foreground italic mt-0.5">
                                  "{unit.notes}"
                                </p>
                              )}
                            </div>
                            <span className="text-[9px] text-muted-foreground flex-shrink-0">
                              {formatMoney(unitPrice)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — resumen + botones */}
          <div className="w-52 flex flex-col flex-shrink-0 p-4">
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Resumen
            </p>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-xs text-inkblack">
                {formatMoney(subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-muted-foreground">Descuento</span>
              <div className="w-24">
                <MoneyInput
                  className="h-6 text-xs"
                  defaultValue={discount}
                  onChange={onUpdateDiscount}
                  max={subtotal}
                />
              </div>
            </div>

            <div className="border-t border-surface mt-2 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-inkblack">Total</span>
                <span className="text-lg font-medium text-brand">
                  {formatMoney(total)}
                </span>
              </div>
            </div>

            {/* Hint delivery incompleto */}
            {isDelivery && !isValid && (
              <p className="text-[9px] text-destructive mt-3 text-center leading-tight">
                Completa nombre, teléfono y dirección para continuar
              </p>
            )}

            <div className="flex-1" />

            <div className="flex flex-col gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isLoading || !isValid}
                onClick={onConfirm}
                className="w-full h-9 bg-brand hover:bg-brand-dark text-white font-medium text-xs disabled:opacity-50"
              >
                {isLoading ? "Procesando..." : "Confirmar →"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
