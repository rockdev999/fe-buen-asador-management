import { LocationWithRoleDTO } from "@/features/locations/dto/location.dto";
import { UserDetailsDTO, UserDTO } from "@/features/users/dto/user.dto";
import { UUID } from "@/types/common";

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginLocationsDTO {
  temporaryToken: string;
  user: UserDTO;
  locations: LocationWithRoleDTO[];
}

export interface SelectLocationRequestDTO {
  locationId: UUID;
}

export interface SelectLocationDTO {
  accessToken: string;
  user: UserDetailsDTO;
}
