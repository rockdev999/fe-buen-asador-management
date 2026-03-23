import { RoleEnum } from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { UUID } from "@/types/common";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface UserDetailsDTO {
  id: UUID;
  name: string;
  email: string;
  role: RoleEnum;
  location: LocationDTO;
}
