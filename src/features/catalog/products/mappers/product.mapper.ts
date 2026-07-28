import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import { mapCategoryShortDTOToModel } from "../../categories/mappers/category.mapper";
import {
  CreateProductDTO,
  ProductDTO,
  ProductPageItemDTO,
} from "../dto/product.dto";
import { Product, ProductPageItem } from "../models/product.model";
import { CreateProductForm } from "../validators/product.schema";

export const mapProductDTOToModel = (dto: ProductDTO): Product => ({
  id: dto.id,
  name: dto.name,
  brand: dto.brand,
  description: dto.description,
  imageUrl: dto.imageUrl,
  price: dto.price,
  available: dto.available,
  isQuantifiable: dto.isQuantifiable,
  haveModifiers: dto.haveModifiers,
  sortOrder: dto.sortOrder,
  category: {
    id: dto.category.id,
    name: dto.category.name,
    sortOrder: dto.category.sortOrder,
  },
  locations: dto.locations.map(mapLocationDTOToModel),
  audit: dto.audit,
});

export const mapProductPageItemDTOToModel = (
  dto: ProductPageItemDTO,
): ProductPageItem => ({
  id: dto.id,
  name: dto.name,
  brand: dto.brand,
  description: dto.description,
  imageUrl: dto.imageUrl,
  price: dto.price,
  available: dto.available,
  isQuantifiable: dto.isQuantifiable,
  haveModifiers: dto.haveModifiers,
  sortOrder: dto.sortOrder,
  category: mapCategoryShortDTOToModel(dto.category),
  locations:
    dto.locations.length > 0 ? dto.locations.map(mapLocationDTOToModel) : [],
});

export const mapProductFormToDTO = (
  form: CreateProductForm,
): CreateProductDTO => ({
  id: form?.id ?? "",
  name: form.name,
  brand: form.brand ?? null,
  description: form.description ?? null,
  imageUrl: form.imageUrl ?? null,
  price: form.price,
  available: form.available,
  isQuantifiable: form.isQuantifiable,
  haveModifiers: form.haveModifiers,
  categoryId: form.categoryId,
  sortOrder: form.sortOrder,
  locationIds: form.locationIds,
});

export const mapProductDTOToFormData = (
  form: CreateProductForm,
  file: File | null,
  removeImage: boolean = false,
): FormData => {
  const dto = mapProductFormToDTO(form);
  const formData = new FormData();

  formData.append(
    "dto",
    JSON.stringify({ ...dto, ...(removeImage && { removeImage: "true" }) }),
  );
  if (file) {
    formData.append("file", file);
  }

  return formData;
};
