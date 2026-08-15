import {
  AdjustmentType,
  KardexReasonTypeEnum,
  KardexTypeEnum,
  StockMesurementUnitTypeEnum,
} from "@/constants";
import { UUID } from "@/types/common";

export interface StockProduct {
  id: UUID;
  product: { id: UUID; name: string; isQuantifiable: boolean };
  location: { id: UUID; name: string };
  currentQuantity: number;
  minimumStock: number;
  unitOfMeasure: StockMesurementUnitTypeEnum;
  updatedAt: string;
}

export interface Kardex {
  id: UUID;
  type: KardexTypeEnum;
  reason: KardexReasonTypeEnum;
  quantity: number;
  previousQuantity: number;
  subsequentQuantity: number;
  referenceId: UUID | null;
  user: { id: UUID; name: string };
  createdAt: string;
}

export interface StockAlert {
  id: UUID;
  product: { id: UUID; name: string };
  location: { id: UUID; name: string };
  currentQuantity: number;
  minimumStock: number;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  resolvedBy: { id: UUID; name: string } | null;
}

export interface AdjustStock {
  productId: UUID;
  adjustmentType: AdjustmentType;
  quantity: number;
  notes?: string;
}
