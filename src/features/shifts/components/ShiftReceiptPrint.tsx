import { forwardRef } from "react";
import { PaymentMethodEnum, ShiftStatusEnum } from "@/constants";
import { formatLocalDateTime } from "@/lib/formatters";
import { ShiftReceipt } from "@/features/pos/models/shift";
import { PAYMENT_LABELS } from "@/utils/generalStatus/sale-display";
import { expenseCategoryLabel } from "@/features/finances/expenses/pages/ExpenseColumns";

// Orden del ticket: efectivo primero, luego tarjeta y QR.
const METHOD_ORDER = [
  PaymentMethodEnum.CASH,
  PaymentMethodEnum.BANK_TRANSFER,
  PaymentMethodEnum.QR,
];

const STATUS_LABEL: Partial<Record<ShiftStatusEnum, string>> = {
  [ShiftStatusEnum.PENDING]: "PENDIENTE DE APROBACIÓN",
  [ShiftStatusEnum.CLOSED]: "APROBADO",
};

/** Monto sin símbolo, formato local ("15 034,00"); "—" si no hay dato. */
function num(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Row({
  label,
  value,
  strong,
  indent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`ticket-row${strong ? " ticket-strong" : ""}${indent ? " ticket-indent" : ""}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

interface ShiftReceiptPrintProps {
  receipt: ShiftReceipt;
}

/**
 * Comprobante de cierre de caja (80 mm). Se renderiza oculto y se imprime con
 * usePrintTicket, igual que el ticket de venta.
 */
export const ShiftReceiptPrint = forwardRef<
  HTMLDivElement,
  ShiftReceiptPrintProps
>(({ receipt }, ref) => {
  const methods = METHOD_ORDER.map((method) => ({
    method,
    sales: receipt.sales.byPaymentMethod.find((m) => m.method === method),
    rec: receipt.reconciliation.find((r) => r.method === method),
  }));
  const { cashDrawer, totals } = receipt;

  return (
    <div ref={ref} className="ticket-print">
      <div className="ticket-center">
        <p className="ticket-title">CIERRE DE CAJA</p>
        <p className="ticket-sub">
          {receipt.location.name}
          {receipt.location.address ? ` — ${receipt.location.address}` : ""}
        </p>
      </div>
      <Row label="Cajero" value={receipt.cashier.name} />
      <Row label="Apertura" value={formatLocalDateTime(receipt.openedAt)} />
      <Row
        label="Cierre"
        value={receipt.closedAt ? formatLocalDateTime(receipt.closedAt) : "—"}
      />
      <Row
        label="Estado"
        value={STATUS_LABEL[receipt.status] ?? receipt.status}
      />

      <div className="ticket-divider" />
      <Row
        label={`VENTAS (${receipt.sales.count})`}
        value={num(receipt.sales.total)}
        strong
      />
      {methods.map(({ method, sales }) => (
        <Row
          key={method}
          indent
          label={`${PAYMENT_LABELS[method]} (${sales?.count ?? 0})`}
          value={num(sales?.total ?? 0)}
        />
      ))}
      <Row
        label={`Anuladas (${receipt.sales.annulled.count})`}
        value={num(receipt.sales.annulled.total)}
      />

      <div className="ticket-divider" />
      <Row
        label={`EGRESOS (${receipt.expenses.count})`}
        value={num(receipt.expenses.total)}
        strong
      />
      {receipt.expenses.items.map((item, i) => (
        <Row
          key={i}
          indent
          label={`${item.description} — ${expenseCategoryLabel(item.category)}`}
          value={num(item.amount)}
        />
      ))}
      <Row
        label={`NÓMINA (${receipt.payroll.count})`}
        value={num(receipt.payroll.total)}
        strong
      />
      {receipt.payroll.items.map((item, i) => (
        <Row
          key={i}
          indent
          label={
            item.roleDescription
              ? `${item.employeeName} — ${item.roleDescription}`
              : item.employeeName
          }
          value={num(item.amount)}
        />
      ))}

      <div className="ticket-divider" />
      <p className="ticket-section">CUADRE DE CAJA (EFECTIVO)</p>
      <Row indent label="Fondo inicial" value={num(cashDrawer.initialAmount)} />
      <Row
        indent
        label="+ Ventas en efectivo"
        value={num(cashDrawer.cashSales)}
      />
      <Row indent label="− Egresos" value={num(cashDrawer.expenses)} />
      <Row indent label="− Nómina" value={num(cashDrawer.payroll)} />
      <Row indent label="= Esperado" value={num(cashDrawer.expected)} strong />
      <Row indent label="Declarado" value={num(cashDrawer.declared)} />
      <Row
        indent
        label="Diferencia"
        value={num(cashDrawer.difference)}
        strong
      />

      <div className="ticket-divider" />
      <div className="ticket-grid4 ticket-grid4-head">
        <span>CONCILIACIÓN</span>
        <span>Declarado</span>
        <span>Esperado</span>
        <span>Dif.</span>
      </div>
      {methods.map(({ method, rec }) => (
        <div key={method} className="ticket-grid4">
          <span>{PAYMENT_LABELS[method]}</span>
          <span>{num(rec?.declared)}</span>
          <span>{num(rec?.expected)}</span>
          <span>{num(rec?.difference)}</span>
        </div>
      ))}
      <div className="ticket-grid4 ticket-strong">
        <span>TOTAL</span>
        <span>{num(totals.declared)}</span>
        <span>{num(totals.expected)}</span>
        <span>{num(totals.difference)}</span>
      </div>

      <div className="ticket-divider" />
      {receipt.notes && (
        <p className="ticket-free">Nota cajero: {receipt.notes}</p>
      )}
      {receipt.review && (
        <p className="ticket-free">
          Aprobado por {receipt.review.reviewedBy.name} ·{" "}
          {formatLocalDateTime(receipt.review.reviewedAt)}
          {receipt.review.notes ? ` — ${receipt.review.notes}` : ""}
        </p>
      )}

      <p className="ticket-signature">Firma cajero: ____________________</p>
      <p className="ticket-sub">
        Impreso: {formatLocalDateTime(receipt.generatedAt)}
      </p>
    </div>
  );
});

ShiftReceiptPrint.displayName = "ShiftReceiptPrint";
