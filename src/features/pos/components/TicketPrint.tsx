import { forwardRef } from "react";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { Sale } from "../models/sale";

interface TicketPrintProps {
  sale: Sale;
}

export const TicketPrint = forwardRef<HTMLDivElement, TicketPrintProps>(
  ({ sale }, ref) => {
    return (
      <div ref={ref} className="ticket-print">
        {/* Encabezado */}
        <div className="ticket-center">
          <p className="ticket-title">BUEN ASADOR</p>
          <p className="ticket-sub">{sale.location.name}</p>
          <p className="ticket-sub">Tel: 000-0000</p>
          <p className="ticket-code">{sale.ticketCode}</p>
        </div>
        <div className="ticket-divider" />

        {/* Info pedido */}
        <div className="ticket-row">
          <span>Pedido</span>
          <span>#{sale.ticketCode.slice(-8)}</span>
        </div>
        <div className="ticket-row">
          <span>Fecha</span>
          <span>{formatDateTime(sale.createdAt)}</span>
        </div>
        <div className="ticket-row">
          <span>Cliente</span>
          <span>{sale.customerName}</span>
        </div>
        <div className="ticket-row">
          <span>Tipo</span>
          <span>{sale.orderType}</span>
        </div>
        <div className="ticket-row">
          <span>Cajero</span>
          <span>{sale.cashier.name}</span>
        </div>
        <div className="ticket-divider" />

        {/* Detalle agrupado */}
        <p className="ticket-section">DETALLE</p>
        {sale.groups.map((group) => (
          <div key={group.productId} className="ticket-group">
            {/* Producto header */}
            <div className="ticket-row ticket-group-header">
              <span>
                {group.unitCount} {group.name}
              </span>
              <span>{formatMoney(group.total)}</span>
            </div>
            {/* Unidades */}
            {group.units.map((unit, idx) => (
              <div key={idx} className="ticket-unit-row">
                <span>{unit.modifierLabel}</span>
                <span>{formatMoney(unit.subtotal)}</span>
              </div>
            ))}
          </div>
        ))}

        <div className="ticket-divider" />

        {/* Totales */}
        <div className="ticket-row">
          <span>Subtotal</span>
          <span>{formatMoney(sale.subtotal)}</span>
        </div>
        {sale.totalDiscount > 0 && (
          <div className="ticket-row">
            <span>Descuento</span>
            <span>- {formatMoney(sale.totalDiscount)}</span>
          </div>
        )}
        <div className="ticket-row">
          <span>Efectivo recibido</span>
          <span>{formatMoney(sale.receivedAmount)}</span>
        </div>
        <div className="ticket-row">
          <span>Cambio</span>
          <span>{formatMoney(sale.change)}</span>
        </div>
        <div className="ticket-divider" />
        <div className="ticket-row ticket-total">
          <span>TOTAL</span>
          <span>{formatMoney(sale.total)}</span>
        </div>
        <div className="ticket-divider" />

        {/* Pie */}
        <div className="ticket-center">
          <p className="ticket-sub">¡Gracias por su visita!</p>
          <p className="ticket-sub">Vuelva pronto</p>
        </div>
      </div>
    );
  },
);

TicketPrint.displayName = "TicketPrint";
