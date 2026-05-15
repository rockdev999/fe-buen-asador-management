import { RoleDTO } from "../dto/role.dto";
import { Role } from "../models/role.model";

export const mapRoleDTOToModel = (dto: RoleDTO): Role => ({
  id: dto.id,
  name: dto.name,
});
