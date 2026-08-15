import { zodToFormik } from "@/lib/zodToFormik";
import { IngredientUnitEnum } from "@/constants";
import {
  ingredientCreateSchema,
  CreateIngredientForm,
} from "../validators/ingredient.schema";
import {
  mapIngredientFormToCreateDTO,
  mapIngredientFormToUpdateDTO,
} from "../mappers/ingredient.mapper";

export const IngredientFormConfig = {
  id: "ingredient-form-config",
  initialValues: {
    name: "",
    unitOfMeasure: IngredientUnitEnum.UNIT,
    description: "",
  } as CreateIngredientForm,
  validationSchemaCreate: zodToFormik(ingredientCreateSchema),
  mapFormToCreateDTO: mapIngredientFormToCreateDTO,
  mapFormToUpdateDTO: mapIngredientFormToUpdateDTO,
};
