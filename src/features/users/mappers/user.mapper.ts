import { UserDetailsDTO, UserDTO } from "../dto/user.dto";
import { User, UserDetails } from "../models/user.model";

export const mapUserDTOToModel = (dto: UserDTO): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
});

export const mapUserDetailsDTOToModel = (dto: UserDetailsDTO): UserDetails => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  locationId: dto.location.id,
  locationName: dto.location.name,
});
