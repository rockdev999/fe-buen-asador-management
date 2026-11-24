import {
  IngredientUnitEnum,
  KNOWN_ERROR_CODES,
  StockMesurementUnitTypeEnum,
} from "@/constants";
import { INGREDIENT_UNIT_LABELS } from "@/features/supplies/config/ingredient.table";
import { STOCK_UNIT_LABELS } from "@/features/inventory/config/inventory.table";

/**
 * Aviso de falta de stock que llega en `data.stockWarnings` del 409
 * INSUFFICIENT_STOCK de POST /orders (sin `forceCreate`).
 */
export type StockWarning =
  | {
      type: "PRODUCT_STOCK";
      productId: string;
      productName: string;
      currentStock: number;
      unit: StockMesurementUnitTypeEnum;
    }
  | {
      type: "INGREDIENT_STOCK";
      productId: string;
      productName: string;
      ingredientId: string;
      ingredientName: string;
      currentStock: number;
      unit: IngredientUnitEnum;
    };

/** Extrae los avisos de un error de POST /orders, o null si no es ese caso. */
export function getStockWarnings(
  error: { errorCode?: string; data?: unknown } | null | undefined,
): StockWarning[] | null {
  if (error?.errorCode !== KNOWN_ERROR_CODES.INSUFFICIENT_STOCK) return null;
  const warnings = (error.data as { stockWarnings?: unknown } | undefined)
    ?.stockWarnings;
  return Array.isArray(warnings) && warnings.length > 0
    ? (warnings as StockWarning[])
    : null;
}

export function stockWarningUnitLabel(warning: StockWarning): string {
  return warning.type === "INGREDIENT_STOCK"
    ? (INGREDIENT_UNIT_LABELS[warning.unit] ?? warning.unit)
    : (STOCK_UNIT_LABELS[warning.unit] ?? warning.unit);
}
