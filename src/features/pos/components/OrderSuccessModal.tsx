import { CheckCircle } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sale } from "../models/sale";

interface OrderSuccessModalProps {
  sale: Sale;
  customerName?: string | null;
  onPrintTicket: () => void;
  onEmitInvoice: () => void;
  onClose: () => void;
}

export function OrderSuccessModal({
  sale,
  customerName,
  onPrintTicket,
  onEmitInvoice,
  onClose,
}: OrderSuccessModalProps) {
  return (
    <div className="absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-500" />
        </div>

        <h2 className="text-base font-medium text-inkblack mb-1">
          Pago registrado
        </h2>
        {customerName && (
          <p className="text-sm text-muted-foreground mb-1">{customerName}</p>
        )}
        <p className="text-xl font-medium text-brand mb-5">
          {formatMoney(sale.total)}
        </p>

        {/* Items resumen */}
        <div className="bg-surface rounded-xl p-3 mb-5 text-left">
          {sale.groups.map((group) => (
            <div key={group.productId} className="mb-2 last:mb-0">
              {/* Producto header */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-xs font-medium text-inkblack">
                  {group.unitCount} {group.name}
                </span>
                <span className="text-xs font-medium text-brand">
                  {formatMoney(group.total)}
                </span>
              </div>

              {/* Unidades */}
              <div className="pl-2 border-l border-surface ml-1">
                {group.units.map((unit, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-0.5"
                  >
                    <span className="text-[10px] text-muted-foreground">
                      {unit.modifierLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatMoney(unit.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={onPrintTicket}
            variant="outline"
            className="w-full h-9 text-sm"
          >
            Imprimir ticket
          </Button>
          <Button
            type="button"
            onClick={onEmitInvoice}
            variant="outline"
            className="w-full h-9 text-sm border-brand text-brand hover:bg-orange-50"
          >
            Emitir factura
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="w-full h-9 bg-brand hover:bg-brand-dark text-white font-medium text-sm"
          >
            Nuevo pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
