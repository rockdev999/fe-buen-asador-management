import { zodToFormik } from "@/lib/zodToFormik";
import {
  createRecipeSchema,
  CreateRecipeForm,
  updateRecipeQuantitySchema,
  UpdateRecipeQuantityForm,
} from "../validators/recipe.schema";
import {
  mapRecipeFormToCreateDTO,
  mapRecipeQuantityFormToUpdateDTO,
} from "../mappers/recipe.mapper";

export const CreateRecipeFormConfig = {
  id: "create-recipe-form-config",
  initialValues: {
    productId: "",
    ingredients: [{ ingredientId: "", quantityUsed: 0 }],
  } as CreateRecipeForm,
  validationSchemaCreate: zodToFormik(createRecipeSchema),
  mapFormToDTO: mapRecipeFormToCreateDTO,
};

export const UpdateRecipeQuantityFormConfig = {
  id: "update-recipe-quantity-form-config",
  initialValues: {
    quantityUsed: 0,
  } as UpdateRecipeQuantityForm,
  validationSchemaCreate: zodToFormik(updateRecipeQuantitySchema),
  mapFormToDTO: mapRecipeQuantityFormToUpdateDTO,
};
