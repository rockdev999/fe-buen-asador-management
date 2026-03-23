import { LocationWithRoleDTO } from "../dto/location.dto";
import { Location } from "../models/location.model";

export const mapLocationDTOToModel = (dto: LocationWithRoleDTO): Location => ({
  id: dto.id,
  name: dto.name,
  role: dto.role,
});
