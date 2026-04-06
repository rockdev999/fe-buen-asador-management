import { ModifierDTO } from "../dto/modifier.dto";
import { Modifier } from "../models/modifier";

export const mapModifierDTOToModel = (dto: ModifierDTO): Modifier => {
  return {
    id: dto.id,
    name: dto.name,
    extraPrice: dto.extraPrice,
  };
};
