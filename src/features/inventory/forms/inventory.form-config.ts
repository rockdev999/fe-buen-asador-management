import { zodToFormik } from "@/lib/zodToFormik";
import { AdjustmentType } from "@/constants";
import {
  adjustStockSchema,
  AdjustStockForm,
  createStockSchema,
  CreateStockForm,
} from "../validators/inventory.schema";
import {
  mapAdjustStockFormToDTO,
  mapCreateStockFormToDTO,
} from "../mappers/inventory.mapper";

export const AdjustStockFormConfig = {
  id: "adjust-stock-form-config",
  initialValues: {
    productId: "",
    adjustmentType: AdjustmentType.ADD,
    quantity: 0,
    notes: "",
  } as AdjustStockForm,
  validationSchemaCreate: zodToFormik(adjustStockSchema),
  mapFormToDTO: mapAdjustStockFormToDTO,
};

export const CreateStockFormConfig = {
  id: "create-stock-form-config",
  initialValues: {
    locationId: "",
    productId: "",
    quantity: 0,
    notes: "",
  } as CreateStockForm,
  validationSchemaCreate: zodToFormik(createStockSchema),
  mapFormToDTO: mapCreateStockFormToDTO,
};
