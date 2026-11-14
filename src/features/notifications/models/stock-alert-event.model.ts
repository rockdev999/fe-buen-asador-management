import { ISODateTimeString, UUID } from "@/types/common";

export enum AlertSourceEnum {
  STOCK_PRODUCT = "STOCK_PRODUCT",
  STOCK_INGREDIENT = "STOCK_INGREDIENT",
}

/** Payload del evento `alert` de GET /notifications/stream. */
export interface StockAlertEvent {
  source: AlertSourceEnum;
  alertId: UUID;
  locationId: UUID;
  /** Nombre del producto o insumo. */
  name: string;
  currentQuantity: number;
  minimumStock: number;
  createdAt: ISODateTimeString;
}
