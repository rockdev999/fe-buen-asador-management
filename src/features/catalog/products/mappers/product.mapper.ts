import { mapCategoryShortDTOToModel } from "../../categories/mappers/category.mapper";
import {
  CreateProductDTO,
  ProductDTO,
  ProductLocationDTO,
  ProductPageItemDTO,
} from "../dto/product.dto";
import {
  Product,
  ProductLocation,
  ProductPageItem,
} from "../models/product.model";

export const mapProductLocationDTOToModel = (
  dto: ProductLocationDTO,
): ProductLocation => ({
  id: dto.id,
  name: dto.name,
  // Respuestas anteriores al campo: se asume disponible.
  available: dto.available ?? true,
  price: dto.price ?? null,
  effectivePrice: dto.effectivePrice ?? 0,
});
import { CreateProductForm } from "../validators/product.schema";

export const mapProductDTOToModel = (dto: ProductDTO): Product => ({
  id: dto.id,
  name: dto.name,
  brand: dto.brand,
  description: dto.description,
  imageUrl: dto.imageUrl,
  price: dto.price,
  // Respuestas anteriores al campo: el precio devuelto era el general.
  basePrice: dto.basePrice ?? dto.price,
  available: dto.available,
  isQuantifiable: dto.isQuantifiable,
  haveModifiers: dto.haveModifiers,
  sortOrder: dto.sortOrder,
  category: {
    id: dto.category.id,
    name: dto.category.name,
    sortOrder: dto.category.sortOrder,
  },
  locations: dto.locations.map(mapProductLocationDTOToModel),
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
  basePrice: dto.basePrice ?? dto.price,
  available: dto.available,
  isQuantifiable: dto.isQuantifiable,
  haveModifiers: dto.haveModifiers,
  sortOrder: dto.sortOrder,
  category: mapCategoryShortDTOToModel(dto.category),
  locations:
    dto.locations.length > 0
      ? dto.locations.map(mapProductLocationDTOToModel)
      : [],
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
  // Siempre se envía, con una entrada por sucursal elegida: así el backend
  // reemplaza los precios y las sucursales quitadas vuelven al general.
  // Un precio igual al general se envía como null para que siga al general
  // si este cambia después.
  locationPrices: form.locationIds.map((locationId) => {
    const price =
      form.locationPrices?.find((lp) => lp.locationId === locationId)?.price ??
      null;
    return { locationId, price: price === form.price ? null : price };
  }),
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
