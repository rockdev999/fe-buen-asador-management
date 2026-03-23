import { UserDTO } from "../dto/user.dto";
import { User } from "../models/user.model";

export const mapUserDTOToModel = (dto: UserDTO): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
});
