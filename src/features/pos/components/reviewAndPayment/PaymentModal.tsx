import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { Button } from "@/components/ui/button";
import { PaymentMethodEnum } from "@/constants";
import { PAYMENT_METHOD_OPTIONS } from "@/constants/enums/pos.enum";
import { cn, formatMoney } from "@/lib/utils";
import { ArrowRight, Banknote, CreditCard, QrCode, X } from "lucide-react";
import { useState } from "react";

const METHOD_ICONS: Record<PaymentMethodEnum, React.ElementType> = {
  [PaymentMethodEnum.CASH]: Banknote,
  [PaymentMethodEnum.BANK_TRANSFER]: CreditCard,
  [PaymentMethodEnum.QR]: QrCode,
};

interface PaymentModalProps {
  clientName?: string | null;
  getSubtotal: () => number;
  getTotal: () => number;
  discount: number;
  onUpdateDiscount: (value: number) => void;
  onConfirm: (method: PaymentMethodEnum) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function PaymentModal({
  clientName,
  getSubtotal,
  getTotal,
  discount,
  onUpdateDiscount,
  onConfirm,
  onClose,
  isLoading,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodEnum>(
    PaymentMethodEnum.CASH,
  );
  const [received, setReceived] = useState<number>(0);

  const subtotal = getSubtotal();
  const total = getTotal();
  const change = Math.max(0, received - total);
  const isCash = method === PaymentMethodEnum.CASH;
  const canConfirm = !isLoading && (!isCash || received >= total);
  const missing =
    isCash && received > 0 && received < total ? total - received : 0;

  // Si cambia a no-efectivo, resetea el monto recibido
  function handleMethodChange(m: PaymentMethodEnum) {
    setMethod(m);
    if (m !== PaymentMethodEnum.CASH) setReceived(0);
  }

  return (
    <div className="absolute inset-0 bg-inkblack/50 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-80 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-inkblack">
              Registrar cobro
            </h2>
            {clientName && (
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Cliente:{" "}
                <span className="font-semibold text-inkblack">
                  {clientName}
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-surface flex items-center justify-center text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors mt-0.5"
          >
            <X size={13} />
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          {/* Métodos de pago */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
              Método de pago
            </p>
            <div className="flex gap-2">
              {PAYMENT_METHOD_OPTIONS.map((opt) => {
                const Icon = METHOD_ICONS[opt.value] ?? Banknote;
                const isActive = method === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleMethodChange(opt.value)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-[1.5px] transition-all duration-150",
                      isActive
                        ? "border-brand bg-orange-50 text-brand"
                        : "border-surface text-muted-foreground hover:border-brand/30 hover:bg-orange-50/30",
                    )}
                  >
                    <Icon size={16} />
                    <span className="text-[12px] font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen de montos */}
          <div className="bg-surface/40 rounded-xl px-3.5 py-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-muted-foreground">
                Subtotal
              </span>
              <span className="text-[12px] text-inkblack tabular-nums">
                {formatMoney(subtotal)}
              </span>
            </div>

            {/* Descuento */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted-foreground flex-shrink-0">
                Descuento
              </span>
              <div className="w-28">
                <MoneyInput
                  className="h-7 text-xs text-right"
                  defaultValue={discount}
                  onChange={onUpdateDiscount}
                  max={subtotal}
                />
              </div>
            </div>

            <div className="border-t border-surface/80 pt-2 flex justify-between items-baseline">
              <span className="text-[12px] font-semibold text-inkblack">
                Total
              </span>
              <span className="text-[20px] font-bold text-inkblack tabular-nums">
                {formatMoney(total)}
              </span>
            </div>
          </div>

          {/* Efectivo — monto recibido y cambio */}
          {isCash && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                Efectivo
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] text-muted-foreground flex-shrink-0">
                  Recibido
                </span>
                <div className="w-36">
                  <MoneyInput
                    className="h-8 text-sm text-right font-medium"
                    onChange={setReceived}
                  />
                </div>
              </div>

              {/* Cambio */}
              <div
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200",
                  change > 0
                    ? "bg-green-50 border border-green-100"
                    : received > 0 && received < total
                      ? "bg-red-50 border border-red-100"
                      : "bg-surface/40",
                )}
              >
                <span
                  className={cn(
                    "text-[12px] font-medium",
                    change > 0
                      ? "text-green-700"
                      : received > 0 && received < total
                        ? "text-red-600"
                        : "text-muted-foreground",
                  )}
                >
                  {change > 0
                    ? "Vuelto"
                    : received > 0 && received < total
                      ? "Falta"
                      : "Cambio"}
                </span>
                <span
                  className={cn(
                    "text-[16px] font-bold tabular-nums",
                    change > 0
                      ? "text-green-700"
                      : received > 0 && received < total
                        ? "text-red-600"
                        : "text-muted-foreground/40",
                  )}
                >
                  {change > 0
                    ? formatMoney(change)
                    : missing > 0
                      ? formatMoney(missing)
                      : "Bs. 0.00"}
                </span>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-9 px-4 border border-muted-foreground/20 text-[14px] text-muted-foreground hover:text-inkblack"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!canConfirm}
              loading={isLoading}
              onClick={() => onConfirm(method)}
              className={cn(
                "flex-1 h-9 text-[14px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all",
                canConfirm
                  ? "bg-brand hover:bg-brand-dark"
                  : "bg-muted-foreground/20 cursor-not-allowed",
              )}
            >
              <span className="flex items-center gap-1.5">
                Confirmar cobro
                <ArrowRight size={13} />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
