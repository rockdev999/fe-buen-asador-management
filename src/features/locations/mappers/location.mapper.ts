import { LocationWithRoleDTO } from "../dto/location.dto";
import { LocationWithRole } from "../models/location.model";

export const mapLocationDTOToModel = (
  dto: LocationWithRoleDTO,
): LocationWithRole => ({
  id: dto.id,
  name: dto.name,
  role: dto.role,
});
