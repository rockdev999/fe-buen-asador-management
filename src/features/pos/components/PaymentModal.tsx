import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { Button } from "@/components/ui/button";
import { PaymentMethodEnum } from "@/constants";
import { PAYMENT_METHOD_OPTIONS } from "@/constants/enums/pos.enum";
import { cn, formatMoney } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  getTotal: () => number;
  onConfirm: (method: PaymentMethodEnum) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function PaymentModal({
  getTotal,
  onConfirm,
  onClose,
  isLoading,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodEnum>(
    PaymentMethodEnum.CASH,
  );
  const [received, setReceived] = useState<number>(0);

  const total = getTotal();
  const change = Math.max(0, received - total);
  const isCash = method === PaymentMethodEnum.CASH;

  // Si cambia a no-efectivo, resetea el monto recibido
  function handleMethodChange(m: PaymentMethodEnum) {
    setMethod(m);
    if (m !== PaymentMethodEnum.CASH) setReceived(0);
  }

  return (
    <div className="absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-inkblack">
            Registrar pago
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-inkblack"
          >
            <X size={16} />
          </button>
        </div>

        {/* Métodos */}
        <div className="flex gap-2 mb-5">
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleMethodChange(opt.value)}
              className={cn(
                "flex-1 py-2.5 text-xs font-medium rounded-lg border-[1.5px] transition-all",
                method === opt.value
                  ? "border-brand text-brand bg-orange-50"
                  : "border-surface text-muted-foreground hover:border-brand-light",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-3 border-t border-surface">
          <span className="text-sm text-muted-foreground">Total a cobrar</span>
          <span className="text-lg font-medium text-inkblack">
            {formatMoney(total)}
          </span>
        </div>

        {/* Efectivo — monto recibido y cambio */}
        {isCash && (
          <div className="py-3 border-b border-surface mb-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground flex-shrink-0">
                Monto recibido
              </span>
              <div className="w-36">
                <MoneyInput className="h-8 text-sm" onChange={setReceived} />
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                change > 0 ? "bg-green-50" : "bg-surface",
              )}
            >
              <span className="text-sm text-muted-foreground">Cambio</span>
              <span
                className={cn(
                  "text-base font-medium",
                  change > 0 ? "text-green-600" : "text-muted-foreground",
                )}
              >
                {formatMoney(change)}
              </span>
            </div>
          </div>
        )}

        {/* Sin efectivo — solo separador */}
        {!isCash && <div className="border-b border-surface mb-5" />}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-9 text-sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isLoading || (isCash && received < total)}
            onClick={() => onConfirm(method)}
            className="flex-[2] h-9 bg-brand hover:bg-brand-dark text-white font-medium text-sm disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : "Confirmar cobro"}
          </Button>
        </div>

        {/* Hint si falta monto */}
        {isCash && received < total && received > 0 && (
          <p className="text-[10px] text-destructive text-center mt-2">
            Faltan {formatMoney(total - received)} para completar el pago
          </p>
        )}
      </div>
    </div>
  );
}
