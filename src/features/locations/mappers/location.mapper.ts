import {
  LocationDTO,
  LocationSimpleDTO,
  LocationWithRoleDTO,
} from "../dto/location.dto";
import {
  Location,
  LocationSimple,
  LocationWithRole,
} from "../models/location.model";

export const mapLocationWithRoleDTOToModel = (
  dto: LocationWithRoleDTO,
): LocationWithRole => ({
  id: dto.id,
  name: dto.name,
  role: dto.role,
});

export const mapLocationDTOToModel = (dto: LocationDTO): Location => ({
  id: dto.id,
  name: dto.name,
});

export const mapLocationSimpleDTOToModel = (
  dto: LocationSimpleDTO,
): LocationSimple => ({
  id: dto.id,
  name: dto.name,
  active: dto.active,
});
