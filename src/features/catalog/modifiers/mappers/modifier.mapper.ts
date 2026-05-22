import { Modifier } from "@/features/catalog/modifiers/models/modifier.model";
import { ModifierDTO } from "../dto/modifier.dto";

export const mapModifierDTOToModel = (dto: ModifierDTO): Modifier => {
  return {
    id: dto.id,
    name: dto.name,
    extraPrice: dto.extraPrice,
  };
};
