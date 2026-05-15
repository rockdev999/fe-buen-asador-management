import { RoleEnum } from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { ISODateTimeString, UUID } from "@/types/common";
import { RoleDTO } from "./role.dto";
import { Audit } from "@/types/audit.types";

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

export interface UserShortDTO {
  id: UUID;
  name: string;
}

export interface UserLocationItemDTO {
  id: UUID;
  name: string;
  role: RoleDTO | null;
}

export interface UserPageItemDTO {
  id: UUID;
  name: string;
  email: string;
  active: boolean;
  createdAt: ISODateTimeString;
  locations: UserLocationItemDTO[] | null;
}

export interface UserLocationDTO {
  id: UUID;
  location: LocationDTO;
  role: RoleDTO;
  activeLocation: boolean;
}

export interface UserLocationsDTO {
  id: UUID;
  name: string;
  email: string;
  active: boolean;
  audit: Audit;
  locations: UserLocationDTO[];
}

export interface CreateUserDTO {
  id?: UUID;
  name: string;
  email: string;
  password?: string;
}
