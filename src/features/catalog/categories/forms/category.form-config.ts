import { zodToFormik } from "@/lib/zodToFormik";
import {
  categoryCreateSchema,
  CreateCategoryForm,
} from "../validators/category.schema";
import { mapCategoryFormToDTO } from "../mappers/category.mapper";

export const CategoryFormConfig = {
  id: "category-form-config",
  initialValues: {
    name: "",
    sortOrder: "",
  } as CreateCategoryForm,
  validationSchemaCreate: zodToFormik(categoryCreateSchema),
  mapFormToDTO: mapCategoryFormToDTO,
};
