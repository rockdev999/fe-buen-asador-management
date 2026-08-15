import { zodToFormik } from "@/lib/zodToFormik";
import { AdjustmentType } from "@/constants";
import {
  adjustIngredientStockSchema,
  AdjustIngredientStockForm,
  createIngredientStockSchema,
  CreateIngredientStockForm,
} from "../validators/ingredient-stock.schema";
import {
  mapAdjustIngredientStockFormToDTO,
  mapCreateIngredientStockFormToDTO,
} from "../mappers/ingredient.mapper";

export const AdjustIngredientStockFormConfig = {
  id: "adjust-ingredient-stock-form-config",
  initialValues: {
    ingredientId: "",
    adjustmentType: AdjustmentType.ADD,
    quantity: 0,
    unitCost: undefined,
    notes: "",
  } as AdjustIngredientStockForm,
  validationSchemaCreate: zodToFormik(adjustIngredientStockSchema),
  mapFormToDTO: mapAdjustIngredientStockFormToDTO,
};

export const CreateIngredientStockFormConfig = {
  id: "create-ingredient-stock-form-config",
  initialValues: {
    locationId: "",
    ingredientId: "",
    quantity: 0,
    unitCost: undefined,
    notes: "",
  } as CreateIngredientStockForm,
  validationSchemaCreate: zodToFormik(createIngredientStockSchema),
  mapFormToDTO: mapCreateIngredientStockFormToDTO,
};
