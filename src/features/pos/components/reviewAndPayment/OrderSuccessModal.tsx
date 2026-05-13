import { formatMoney } from "@/lib/utils";
import { CheckCircle, Plus, Receipt, TicketCheck, X } from "lucide-react";
import { Sale } from "../../../sales/models/sale";
import { t } from "@/locales/es";

const trans = t.finances;

interface OrderSuccessModalProps {
  sale: Sale;
  customerName?: string | null;
  showDetails?: boolean;
  onEmitInvoice: () => void;
  onClose: () => void;
}

export function OrderSuccessModal({
  sale,
  customerName,
  showDetails = false,
  onEmitInvoice,
  onClose,
}: OrderSuccessModalProps) {
  const change = sale.receivedAmount - sale.total;

  return (
    <div className="absolute inset-0 bg-inkblack/50 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[500px] overflow-hidden shadow-2xl px-3 py-2 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-black/30 flex items-center justify-center text-black/70 hover:text-black hover:border-black/60 transition-colors"
        >
          <X size={13} />
        </button>
        {/* Success header */}
        <div className="bg-green-50 px-6 pt-4 pb-2 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
            <CheckCircle
              size={28}
              className="text-green-500"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="text-[20px] font-semibold text-green-900 mb-0.5">
            ¡Pago registrado!
          </h2>
          {customerName && (
            <p className="text-[12px] text-green-700/70">{customerName}</p>
          )}
        </div>

        {/* Montos */}
        <div className="px-5 py-2 flex flex-col gap-2.5">
          {/* Ticket code */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TicketCheck size={15} className="text-muted-foreground/50" />
            <span className="text-[14px] font-mono text-muted-foreground/70 tracking-wider">
              {sale.ticketCode}
            </span>
          </div>

          {showDetails && (
            <div className="bg-surface rounded-xl p-3 mb-5 text-left overflow-auto max-h-40">
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
                  {group.units.map((unit, idx) =>
                    unit.modifierLabel || unit.notes ? (
                      <div
                        key={idx}
                        className="flex justify-between items-start gap-2 pl-2 border-l-2 border-brand/20 mt-1"
                      >
                        <div className="flex flex-col min-w-0">
                          {unit.modifierLabel && (
                            <span className="text-[10px] text-brand/70 font-medium truncate">
                              {unit.modifierLabel}
                            </span>
                          )}
                          {unit.notes && (
                            <span className="text-[10px] text-muted-foreground italic">
                              "{unit.notes}"
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">
                          {formatMoney(unit.subtotal)}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Total destacado */}
          <div className="bg-surface/50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-[14px] text-muted-foreground">
              Total cobrado
            </span>
            <span className="text-[16px] font-bold text-inkblack tabular-nums">
              {formatMoney(sale.total)}
            </span>
          </div>

          {/* Cambio si aplica */}
          {change > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 rounded-xl border border-green-100">
              <span className="text-[14px] text-green-700">Vuelto</span>
              <span className="text-[16px] font-bold text-green-700 tabular-nums">
                {formatMoney(change)}
              </span>
            </div>
          )}

          {/* Método de pago */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[14px] text-muted-foreground/60">Método</span>
            <span className="text-[14px] font-medium text-muted-foreground capitalize">
              {sale.paymentMethod
                ? trans.income.methods[sale.paymentMethod]
                : "—"}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-5 pb-5 flex flex-col gap-2 border-t border-surface pt-4">
          <button
            type="button"
            disabled
            onClick={onEmitInvoice}
            className="w-full h-9 rounded-xl border border-gray-300 text-gray-500 text-[14px] font-medium bg-gray-100 flex items-center justify-center gap-1.5 cursor-not-allowed"
          >
            <Receipt size={13} />
            Emitir factura
          </button>
          {!showDetails && (
            <button
              type="button"
              onClick={onClose}
              className="w-full h-10 rounded-xl bg-brand hover:bg-brand-dark text-white text-[14px]
                       font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              Nuevo pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
