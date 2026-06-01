import { Modifier } from "@/features/catalog/modifiers/models/modifier.model";
import { CreateModifierDTO, ModifierDTO } from "../dto/modifier.dto";
import { CreateModifierForm } from "../validators/modifier.schema";

export const mapModifierDTOToModel = (dto: ModifierDTO): Modifier => {
  return {
    id: dto.id,
    name: dto.name,
    extraPrice: dto.extraPrice,
    active: dto.active,
    location: dto.location,
    audit: dto.audit,
  };
};

export const mapModifierFormToDTO = (
  form: CreateModifierForm,
): CreateModifierDTO => ({
  id: form.id,
  name: form.name,
  extraPrice: form.extraPrice,
  active: form.active,
  locationId: form.location.id,
});
