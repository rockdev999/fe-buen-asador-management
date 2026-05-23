import {
  CategoryDTO,
  CategoryProductDTO,
  CategoryShortDTO,
  MenuCategoryDTO,
} from "../dto/cateogory.dto";
import {
  Category,
  CategoryProduct,
  CategoryShort,
  MenuCategory,
} from "../models/category.model";

export const mapCategoryDTOToModel = (dto: CategoryDTO): Category => ({
  id: dto.id,
  name: dto.name,
  createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
  updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
});

export const mapCategoryProductDTOToModel = (
  dto: CategoryProductDTO,
): CategoryProduct => ({
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
});

export const mapMenuCategoryDTOToModel = (
  dto: MenuCategoryDTO,
): MenuCategory => ({
  id: dto.id,
  name: dto.name,
  sortOrder: dto.sortOrder,
  products: dto.products.map(mapCategoryProductDTOToModel),
});

export const mapCategoryShortDTOToModel = (
  dto: CategoryShortDTO,
): { id: string; name: string; sortOrder: number } => ({
  id: dto.id,
  name: dto.name,
  sortOrder: dto.sortOrder,
});

export const mapCategorySimpleDTOToModel = (
  dto: CategoryShortDTO,
): CategoryShort => ({
  id: dto.id,
  name: dto.name,
  sortOrder: dto.sortOrder,
});
