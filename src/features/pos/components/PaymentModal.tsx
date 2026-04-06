import { Button } from "@/components/ui/button";
import { PaymentMethodEnum } from "@/constants";
import { PAYMENT_METHOD_OPTIONS } from "@/constants/enums/pos.enum";
import { cn, formatMoney } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  total: number;
  onConfirm: (method: PaymentMethodEnum) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function PaymentModal({
  total,
  onConfirm,
  onClose,
  isLoading,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodEnum>(
    PaymentMethodEnum.CASH,
  );

  return (
    <div className="absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80">
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
              onClick={() => setMethod(opt.value)}
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
        <div className="flex justify-between items-center py-3 border-t border-b border-surface mb-5">
          <span className="text-sm text-muted-foreground">Total a cobrar</span>
          <span className="text-lg font-medium text-inkblack">
            {formatMoney(total)}
          </span>
        </div>

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
            disabled={isLoading}
            onClick={() => onConfirm(method)}
            className="flex-[2] h-9 bg-brand hover:bg-brand-dark text-white font-medium text-sm"
          >
            {isLoading ? "Procesando..." : "Confirmar cobro"}
          </Button>
        </div>
      </div>
    </div>
  );
}
