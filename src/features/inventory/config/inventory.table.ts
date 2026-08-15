import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";
import {
  AdjustmentType,
  KardexReasonTypeEnum,
  KardexTypeEnum,
  StockMesurementUnitTypeEnum,
} from "@/constants";

export const STOCK_UNIT_LABELS: Record<StockMesurementUnitTypeEnum, string> = {
  [StockMesurementUnitTypeEnum.UNIT]: "Unidad",
  [StockMesurementUnitTypeEnum.LITER]: "Litro",
  [StockMesurementUnitTypeEnum.KILOGRAM]: "Kilogramo",
  [StockMesurementUnitTypeEnum.SMALL]: "Pequeño",
  [StockMesurementUnitTypeEnum.MEDIUM]: "Mediano",
  [StockMesurementUnitTypeEnum.LARGE]: "Grande",
};

export const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  [AdjustmentType.ADD]: "Agregar",
  [AdjustmentType.SUBTRACT]: "Restar",
  [AdjustmentType.SET]: "Establecer",
};

export const KARDEX_TYPE_LABELS: Record<KardexTypeEnum, string> = {
  [KardexTypeEnum.ENTRY]: "Entrada",
  [KardexTypeEnum.EXIT]: "Salida",
};

export const KARDEX_REASON_LABELS: Record<KardexReasonTypeEnum, string> = {
  [KardexReasonTypeEnum.SALE]: "Venta",
  [KardexReasonTypeEnum.MANUAL_ENTRY]: "Ajuste manual",
};

export const STOCK_DROPDOWNS: FilterDropdown[] = [
  {
    key: "stockLevel",
    placeholder: "Nivel de stock",
    options: [
      { label: "Bajo mínimo", value: "low" },
      { label: "Normal", value: "normal" },
    ],
  },
];
