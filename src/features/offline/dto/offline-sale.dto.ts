// Contrato de POST /api/sales/offline-sync (ver VENTA_OFFLINE_FE.md §5 y §9).

export type OfflineOrderType = "DINE_IN" | "TAKEAWAY";
export type OfflinePaymentMethod = "CASH" | "BANK_TRANSFER";

export interface OfflineSaleModifierDTO {
  modifierId: string;
  extraPrice: number;
}

export interface OfflineSaleItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  modifiers?: OfflineSaleModifierDTO[];
}

export interface OfflineSaleDTO {
  /** UUID v4: clave de idempotencia. */
  id: string;
  ticketCode: string;
  shiftId: string;
  /** ISO 8601: hora real de la venta en el dispositivo. */
  occurredAt: string;
  orderType: OfflineOrderType;
  customerName?: string;
  paymentMethod: OfflinePaymentMethod;
  receivedAmount: number;
  totalDiscount?: number;
  total: number;
  items: OfflineSaleItemDTO[];
}

export interface SyncOfflineSalesRequestDTO {
  deviceId: string;
  sales: OfflineSaleDTO[];
}

export type OfflineSyncStatus = "CREATED" | "DUPLICATE" | "REJECTED";

export type OfflineSaleErrorCode =
  | "OFFLINE_INVALID_DATA"
  | "OFFLINE_SHIFT_NOT_OPEN"
  | "OFFLINE_SHIFT_WRONG_LOCATION"
  | "OFFLINE_ID_CONFLICT"
  | "OFFLINE_PRODUCT_NOT_FOUND"
  | "OFFLINE_MODIFIER_NOT_FOUND"
  | "OFFLINE_TOTAL_MISMATCH"
  | "OFFLINE_INSUFFICIENT_PAYMENT"
  | "OFFLINE_UNEXPECTED_ERROR";

export type OfflineSaleWarning =
  | "PRICE_CHANGED"
  | "PRODUCT_NOT_SELLABLE"
  | "TICKET_CODE_REGENERATED"
  | "OCCURRED_AT_ADJUSTED";

export interface OfflineSyncResultDTO {
  id: string | null;
  status: OfflineSyncStatus;
  ticketCode: string | null;
  total: number | null;
  warnings: OfflineSaleWarning[];
  errorCode: OfflineSaleErrorCode | null;
  message: string | null;
  retryable: boolean;
}

export interface SyncOfflineSalesResponseDTO {
  results: OfflineSyncResultDTO[];
  summary: { created: number; duplicate: number; rejected: number };
}

/**
 * Datos solo para mostrar e imprimir la ficha (nombres de productos y
 * modificadores). Nunca se envían al backend.
 */
export interface QueuedOfflineSaleDisplay {
  locationName: string;
  cashierName: string;
  lines: {
    productId: string;
    productName: string;
    modifierNames: string[];
    notes: string;
    subtotal: number;
  }[];
}

/** Lo que se guarda en IndexedDB (no se envía tal cual). */
export interface QueuedOfflineSale extends OfflineSaleDTO {
  userId: string;
  locationId: string;
  status: "PENDING" | "CONFLICT";
  attempts: number;
  lastErrorCode?: OfflineSaleErrorCode;
  lastMessage?: string;
  display: QueuedOfflineSaleDisplay;
}
