import { AdjustmentType } from "@/constants";
import {
  AdjustIngredientStockDTO,
  CreateIngredientDTO,
  IngredientDTO,
  IngredientKardexDTO,
  IngredientListItemDTO,
  IngredientSimpleDTO,
  IngredientStockAlertDTO,
  IngredientStockDTO,
  UpdateIngredientDTO,
} from "../dto/ingredient.dto";
import {
  Ingredient,
  IngredientKardex,
  IngredientListItem,
  IngredientSimple,
  IngredientStock,
  IngredientStockAlert,
} from "../models/ingredient.model";
import { CreateIngredientForm } from "../validators/ingredient.schema";
import {
  AdjustIngredientStockForm,
  CreateIngredientStockForm,
} from "../validators/ingredient-stock.schema";

export const mapIngredientDTOToModel = (dto: IngredientDTO): Ingredient => ({
  id: dto.id,
  name: dto.name,
  unitOfMeasure: dto.unitOfMeasure,
  description: dto.description,
  audit: dto.audit,
});

export const mapIngredientListItemDTOToModel = (
  dto: IngredientListItemDTO,
): IngredientListItem => ({
  id: dto.id,
  name: dto.name,
  unitOfMeasure: dto.unitOfMeasure,
  description: dto.description,
  createdAt: dto.createdAt,
});

export const mapIngredientSimpleDTOToModel = (
  dto: IngredientSimpleDTO,
): IngredientSimple => ({
  id: dto.id,
  name: dto.name,
  unitOfMeasure: dto.unitOfMeasure,
});

export const mapIngredientStockDTOToModel = (
  dto: IngredientStockDTO,
): IngredientStock => ({
  id: dto.id,
  ingredient: dto.ingredient,
  location: dto.location,
  currentQuantity: dto.currentQuantity,
  minimumStock: dto.minimumStock,
  lastUnitCost: dto.lastUnitCost,
  updatedAt: dto.updatedAt,
});

export const mapIngredientKardexDTOToModel = (
  dto: IngredientKardexDTO,
): IngredientKardex => ({
  id: dto.id,
  type: dto.type,
  reason: dto.reason,
  quantity: dto.quantity,
  previousQuantity: dto.previousQuantity,
  subsequentQuantity: dto.subsequentQuantity,
  unitCost: dto.unitCost,
  referenceId: dto.referenceId,
  user: dto.user,
  createdAt: dto.createdAt,
});

export const mapIngredientStockAlertDTOToModel = (
  dto: IngredientStockAlertDTO,
): IngredientStockAlert => ({
  id: dto.id,
  ingredient: dto.ingredient,
  location: dto.location,
  currentQuantity: dto.currentQuantity,
  minimumStock: dto.minimumStock,
  isResolved: dto.isResolved,
  resolvedAt: dto.resolvedAt,
  createdAt: dto.createdAt,
});

export const mapIngredientFormToCreateDTO = (
  form: CreateIngredientForm,
): CreateIngredientDTO => ({
  name: form.name,
  unitOfMeasure: form.unitOfMeasure,
  description: form.description,
});

export const mapIngredientFormToUpdateDTO = (
  form: CreateIngredientForm,
): UpdateIngredientDTO => ({
  name: form.name,
  unitOfMeasure: form.unitOfMeasure,
  description: form.description,
});

export const mapAdjustIngredientStockFormToDTO = (
  form: AdjustIngredientStockForm,
): AdjustIngredientStockDTO => ({
  ingredientId: form.ingredientId,
  adjustmentType: form.adjustmentType,
  quantity: form.quantity,
  unitCost:
    form.adjustmentType === AdjustmentType.ADD ? form.unitCost : undefined,
  notes: form.notes,
});

export const mapCreateIngredientStockFormToDTO = (
  form: CreateIngredientStockForm,
): AdjustIngredientStockDTO => ({
  ingredientId: form.ingredientId,
  adjustmentType: AdjustmentType.ADD,
  quantity: form.quantity,
  unitCost: form.unitCost,
  notes: form.notes,
});
