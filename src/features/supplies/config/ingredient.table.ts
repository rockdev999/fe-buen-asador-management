import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";
import {
  AdjustmentType,
  IngredientKardexReasonEnum,
  IngredientKardexTypeEnum,
  IngredientUnitEnum,
} from "@/constants";

export const INGREDIENT_UNIT_LABELS: Record<IngredientUnitEnum, string> = {
  [IngredientUnitEnum.KG]: "Kilogramo",
  [IngredientUnitEnum.LB]: "Libra",
  [IngredientUnitEnum.ARROBA]: "Arroba",
  [IngredientUnitEnum.UNIT]: "Unidad",
};

export const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  [AdjustmentType.ADD]: "Agregar",
  [AdjustmentType.SUBTRACT]: "Restar",
  [AdjustmentType.SET]: "Establecer",
};

export const INGREDIENT_KARDEX_TYPE_LABELS: Record<
  IngredientKardexTypeEnum,
  string
> = {
  [IngredientKardexTypeEnum.ENTRY]: "Entrada",
  [IngredientKardexTypeEnum.EXIT]: "Salida",
};

export const INGREDIENT_KARDEX_REASON_LABELS: Record<
  IngredientKardexReasonEnum,
  string
> = {
  [IngredientKardexReasonEnum.PURCHASE]: "Compra",
  [IngredientKardexReasonEnum.SALE_CONSUMPTION]: "Consumo por venta",
  [IngredientKardexReasonEnum.ADJUSTMENT]: "Ajuste manual",
  [IngredientKardexReasonEnum.WASTE]: "Merma",
};

export const INGREDIENT_STOCK_DROPDOWNS: FilterDropdown[] = [
  {
    key: "stockLevel",
    placeholder: "Nivel de stock",
    options: [
      { label: "Bajo mínimo", value: "low" },
      { label: "Normal", value: "normal" },
    ],
  },
];
