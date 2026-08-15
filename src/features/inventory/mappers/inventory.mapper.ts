import {
  AdjustStockDTO,
  KardexDTO,
  StockAlertDTO,
  StockProductDTO,
} from "../dto/inventory.dto";
import { AdjustmentType } from "@/constants";
import { Kardex, StockAlert, StockProduct } from "../models/inventory.model";
import { AdjustStockForm, CreateStockForm } from "../validators/inventory.schema";

export const mapStockProductDTOToModel = (
  dto: StockProductDTO,
): StockProduct => ({
  id: dto.id,
  product: dto.product,
  location: dto.location,
  currentQuantity: dto.currentQuantity,
  minimumStock: dto.minimumStock,
  unitOfMeasure: dto.unitOfMeasure,
  updatedAt: dto.updatedAt,
});

export const mapKardexDTOToModel = (dto: KardexDTO): Kardex => ({
  id: dto.id,
  type: dto.type,
  reason: dto.reason,
  quantity: dto.quantity,
  previousQuantity: dto.previousQuantity,
  subsequentQuantity: dto.subsequentQuantity,
  referenceId: dto.referenceId,
  user: dto.user,
  createdAt: dto.createdAt,
});

export const mapStockAlertDTOToModel = (dto: StockAlertDTO): StockAlert => ({
  id: dto.id,
  product: dto.product,
  location: dto.location,
  currentQuantity: dto.currentQuantity,
  minimumStock: dto.minimumStock,
  isResolved: dto.isResolved,
  resolvedAt: dto.resolvedAt,
  createdAt: dto.createdAt,
  resolvedBy: dto.resolvedBy,
});

export const mapAdjustStockFormToDTO = (
  form: AdjustStockForm,
): AdjustStockDTO => ({
  productId: form.productId,
  adjustmentType: form.adjustmentType,
  quantity: form.quantity,
  notes: form.notes,
});

export const mapCreateStockFormToDTO = (
  form: CreateStockForm,
): AdjustStockDTO => ({
  productId: form.productId,
  adjustmentType: AdjustmentType.SET,
  quantity: form.quantity,
  notes: form.notes,
});
