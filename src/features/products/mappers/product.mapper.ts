import { ProductDTO } from "../dto/product.dto";
import { Product } from "../models/product.model";

export const mapProductDTOToModel = (dto: ProductDTO): Product => ({
  id: dto.id,
  name: dto.name,
  price: dto.price,
  isQuantifiable: dto.isQuantifiable,
  category: {
    id: dto.category.id,
    name: dto.category.name,
  },
  locationId: dto.locationId,
  createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
  updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
});
