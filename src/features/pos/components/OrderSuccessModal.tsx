import { CheckCircle } from "lucide-react";
import { Order } from "../models/order";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OrderSuccessModalProps {
  order: Order;
  onPrintTicket: () => void;
  onEmitInvoice: () => void;
  onClose: () => void;
}

export function OrderSuccessModal({
  order,
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
        <p className="text-sm text-muted-foreground mb-1">
          {order.customerName}
        </p>
        <p className="text-xl font-medium text-brand mb-5">
          {formatMoney(order.total)}
        </p>

        {/* Items resumen */}
        <div className="bg-surface rounded-xl p-3 mb-5 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs py-0.5">
              <span className="text-inkblack">
                {item.name} × {item.quantity}
              </span>
              <span className="text-muted-foreground">
                {formatMoney(item.subtotal)}
              </span>
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
