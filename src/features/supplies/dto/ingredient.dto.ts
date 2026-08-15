import {
  AdjustmentType,
  IngredientKardexReasonEnum,
  IngredientKardexTypeEnum,
  IngredientUnitEnum,
} from "@/constants";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface IngredientDTO {
  id: UUID;
  name: string;
  unitOfMeasure: IngredientUnitEnum;
  description: string | null;
  audit: Audit;
}

export interface IngredientListItemDTO {
  id: UUID;
  name: string;
  unitOfMeasure: IngredientUnitEnum;
  description: string | null;
  createdAt: string;
}

export interface IngredientSimpleDTO {
  id: UUID;
  name: string;
  unitOfMeasure: IngredientUnitEnum;
}

export interface CreateIngredientDTO {
  name: string;
  unitOfMeasure: IngredientUnitEnum;
  description?: string;
}

export type UpdateIngredientDTO = Partial<CreateIngredientDTO>;

export interface IngredientStockDTO {
  id: UUID;
  ingredient: { id: UUID; name: string; unitOfMeasure: IngredientUnitEnum };
  location: { id: UUID; name: string };
  currentQuantity: number;
  minimumStock: number;
  lastUnitCost: number;
  updatedAt: string;
}

export interface IngredientKardexDTO {
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

export interface IngredientStockAlertDTO {
  id: UUID;
  ingredient: { id: UUID; name: string; unitOfMeasure: IngredientUnitEnum };
  location: { id: UUID; name: string };
  currentQuantity: number;
  minimumStock: number;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AdjustIngredientStockDTO {
  ingredientId: UUID;
  adjustmentType: AdjustmentType;
  quantity: number;
  unitCost?: number;
  notes?: string;
}
