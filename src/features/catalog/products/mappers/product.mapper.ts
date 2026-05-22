import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import { mapCategoryShortDTOToModel } from "../../categories/mappers/category.mapper";
import { ProductDTO, ProductPageItemDTO } from "../dto/product.dto";
import { Product, ProductPageItem } from "../models/product.model";

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
  category: {
    id: dto.category.id,
    name: dto.category.name,
  },
  locationId: dto.locationId,
  createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
  updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
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
  location: mapLocationDTOToModel(dto.location),
});
