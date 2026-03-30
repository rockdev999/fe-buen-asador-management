import { CategoryDTO } from "../dto/cateogory.dto";
import { Category } from "../models/category.model";

export const mapCategoryDTOToModel = (dto: CategoryDTO): Category => ({
  id: dto.id,
  name: dto.name,
  createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
  updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
});
