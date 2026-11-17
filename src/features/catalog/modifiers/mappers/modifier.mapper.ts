import {
  Modifier,
  ModifierLocation,
} from "@/features/catalog/modifiers/models/modifier.model";
import { mapLocationDTOToModel } from "@/features/locations/mappers/location.mapper";
import {
  CreateModifierDTO,
  ModifierDTO,
  ModifierLocationDTO,
} from "../dto/modifier.dto";
import { CreateModifierForm } from "../validators/modifier.schema";

export const mapModifierLocationDTOToModel = (
  dto: ModifierLocationDTO,
): ModifierLocation => ({
  ...mapLocationDTOToModel(dto),
  extraPrice: dto.extraPrice ?? null,
  effectiveExtraPrice: dto.effectiveExtraPrice ?? 0,
});

export const mapModifierDTOToModel = (dto: ModifierDTO): Modifier => {
  return {
    id: dto.id,
    name: dto.name,
    extraPrice: dto.extraPrice,
    // Respuestas anteriores al campo: el precio devuelto era el general.
    baseExtraPrice: dto.baseExtraPrice ?? dto.extraPrice,
    active: dto.active,
    locations: dto.locations.map(mapModifierLocationDTOToModel),
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
  locationIds: form.locationIds,
  // Siempre se envía, con una entrada por sucursal elegida: así el backend
  // reemplaza los precios y las sucursales quitadas vuelven al general.
  // Un precio igual al general se envía como null para que siga al general
  // si este cambia después.
  locationPrices: form.locationIds.map((locationId) => {
    const extraPrice =
      form.locationPrices?.find((lp) => lp.locationId === locationId)
        ?.extraPrice ?? null;
    return {
      locationId,
      extraPrice: extraPrice === form.extraPrice ? null : extraPrice,
    };
  }),
});
