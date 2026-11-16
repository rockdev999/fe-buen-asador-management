import { PaymentMethodEnum, ShiftStatusEnum } from "@/constants";
import { UserShortDTO } from "@/features/users/dto/user.dto";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ShiftOpenDTO {
  initialAmount: number;
}

// POST /shifts/close — sucursal y cajero salen del token. Arqueo por método:
// efectivo contado, total de la app del QR y total del tarjetero.
export interface ShiftCloseDTO {
  declaredCash: number;
  declaredQr: number;
  /** BANK_TRANSFER = pago con tarjeta. */
  declaredBankTransfer: number;
  /** Opcional (máx. 500). El cierre siempre pasa; la justificación la exige el admin. */
  notes?: string;
}

export interface ShiftReconciliationItemDTO {
  method: PaymentMethodEnum;
  declared: number | null;
  expected: number | null;
  /** declared - expected (+ sobrante, - faltante). */
  difference: number | null;
}

// POST /shifts/:id/approve — `notes` obligatorio si difference ≠ 0.
export interface ShiftApproveDTO {
  notes?: string;
}

export interface ShiftReviewDTO {
  reviewedBy: UserShortDTO;
  reviewedAt: ISODateTimeString;
  notes: string | null;
}

export interface ShiftDTO {
  id: UUID;
  location: { id: UUID; name: string };
  cashier: UserShortDTO;
  openedAt: ISODateTimeString;
  closedAt: ISODateTimeString | null;
  initialAmount: number;
  /** Solo el efectivo (declarado / esperado / diferencia). */
  declaredAmount: number | null;
  systemAmount: number | null;
  difference: number | null;
  /** Arqueo por método; null mientras el turno está OPEN. */
  reconciliation: ShiftReconciliationItemDTO[] | null;
  /** true si algún método no cuadra; null mientras está OPEN. */
  hasDifference: boolean | null;
  notes: string | null;
  status: ShiftStatusEnum;
  review: ShiftReviewDTO | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ShiftSummaryCountDTO {
  count: number;
  /** null para el CASHIER: el resumen es ciego para todos los montos. */
  total: number | null;
}

// GET /shifts/active/summary (CASHIER: solo cantidades, todos los montos null)
// GET /shifts/:id/summary   (ADMIN/MANAGER, expectedCash calculado)
export interface ShiftSummaryDTO {
  shiftId: UUID;
  openedAt: ISODateTimeString;
  initialAmount: number;
  sales: ShiftSummaryCountDTO & {
    byPaymentMethod: ({ method: PaymentMethodEnum } & ShiftSummaryCountDTO)[];
    annulled: ShiftSummaryCountDTO;
  };
  expenses: ShiftSummaryCountDTO;
  payroll: ShiftSummaryCountDTO;
  pendingOrders: number;
  expectedCash: number | null;
}

export interface ShiftReceiptAmountsDTO {
  declared: number | null;
  expected: number | null;
  difference: number | null;
}

// Comprobante de cierre: en la respuesta de POST /shifts/close (`receipt`) y en
// GET /shifts/:id/receipt (reimpresión). Turnos anteriores al arqueo por
// método traen QR/tarjeta y `totals` en null.
export interface ShiftReceiptDTO {
  shiftId: UUID;
  generatedAt: ISODateTimeString;
  location: { id: UUID; name: string; address: string | null };
  cashier: UserShortDTO;
  status: ShiftStatusEnum;
  openedAt: ISODateTimeString;
  closedAt: ISODateTimeString | null;
  sales: {
    count: number;
    total: number;
    byPaymentMethod: { method: PaymentMethodEnum; count: number; total: number }[];
    annulled: { count: number; total: number };
  };
  expenses: {
    count: number;
    total: number;
    /** category = valor del enum (SERVICES, PERSONNEL, ...). */
    items: {
      description: string;
      category: string;
      amount: number;
      createdAt: ISODateTimeString;
    }[];
  };
  payroll: {
    count: number;
    total: number;
    items: {
      employeeName: string;
      roleDescription: string | null;
      amount: number;
      createdAt: ISODateTimeString;
    }[];
  };
  cashDrawer: {
    initialAmount: number;
    cashSales: number;
    expenses: number;
    payroll: number;
  } & ShiftReceiptAmountsDTO;
  reconciliation: ({ method: PaymentMethodEnum } & ShiftReceiptAmountsDTO)[];
  totals: ShiftReceiptAmountsDTO;
  hasDifference: boolean;
  notes: string | null;
  review: ShiftReviewDTO | null;
}

/** POST /shifts/close: el turno (ya no ciego) más su comprobante. */
export type ShiftCloseResponseDTO = ShiftDTO & { receipt: ShiftReceiptDTO };

export interface ShiftPageParams {
  page: number;
  limit: number;
  status?: ShiftStatusEnum;
  cashierId?: UUID;
  locationId?: UUID;
  dateFrom?: string;
  dateTo?: string;
}
