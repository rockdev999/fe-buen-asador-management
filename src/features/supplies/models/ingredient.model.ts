import {
  AdjustmentType,
  IngredientKardexReasonEnum,
  IngredientKardexTypeEnum,
  IngredientUnitEnum,
} from "@/constants";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface Ingredient {
  id: UUID;
  name: string;
  unitOfMeasure: IngredientUnitEnum;
  description: string | null;
  audit: Audit;
}

export interface IngredientListItem {
  id: UUID;
  name: string;
  unitOfMeasure: IngredientUnitEnum;
  description: string | null;
  createdAt: string;
}

export interface IngredientSimple {
  id: UUID;
  name: string;
  unitOfMeasure: IngredientUnitEnum;
}

export interface IngredientStock {
  id: UUID;
  ingredient: { id: UUID; name: string; unitOfMeasure: IngredientUnitEnum };
  location: { id: UUID; name: string };
  currentQuantity: number;
  minimumStock: number;
  lastUnitCost: number;
  updatedAt: string;
}

export interface IngredientKardex {
  id: UUID;
  type: IngredientKardexTypeEnum;
  reason: IngredientKardexReasonEnum;
  quantity: number;
  previousQuantity: number;
  subsequentQuantity: number;
  unitCost: number | null;
  referenceId: UUID | null;
  user: { id: UUID; name: string };
  createdAt: string;
}

export interface IngredientStockAlert {
  id: UUID;
  ingredient: { id: UUID; name: string; unitOfMeasure: IngredientUnitEnum };
  location: { id: UUID; name: string };
  currentQuantity: number;
  minimumStock: number;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AdjustIngredientStock {
  ingredientId: UUID;
  adjustmentType: AdjustmentType;
  quantity: number;
  unitCost?: number;
  notes?: string;
}
