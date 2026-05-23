import { zodToFormik } from "@/lib/zodToFormik";
import {
  CreateProductForm,
  productCreateSchema,
} from "../validators/product.schema";
import {
  mapProductDTOToFormData,
  mapProductFormToDTO,
} from "../mappers/product.mapper";

export const ProductFormConfig = {
  id: "product-form-config",
  initialValues: {
    name: "",
    brand: "",
    price: 0,
    categoryId: "",
    locationId: "",
    description: "",
    imageUrl: "",
    available: true,
    isQuantifiable: true,
    haveModifiers: false,
  } as CreateProductForm,
  validationSchemaCreate: zodToFormik(productCreateSchema),
  //   validationSchemaUpdate: zodToFormik(productUpdateSchema),
  mapFormToDTO: mapProductFormToDTO,
  mapFormToFormData: mapProductDTOToFormData,
};
