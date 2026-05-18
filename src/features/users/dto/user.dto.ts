import { RoleEnum } from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { ISODateTimeString, UUID } from "@/types/common";
import { RoleDTO } from "./role.dto";
import { Audit } from "@/types/audit.types";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

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
  username: string;
  email: string;
  phone?: string;
  active: boolean;
  positions?: JobPositionEnum[] | [];
  locations: UserLocationItemDTO[] | null;
  createdAt: ISODateTimeString;
}

export interface UserLocationDTO {
  id: UUID;
  location: LocationDTO;
  role: RoleDTO;
  activeLocation: boolean;
}

export interface UserLocationsDTO {
  id: UUID;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  active: boolean;
  description?: string;
  positions?: JobPositionEnum[] | [];
  locations: UserLocationDTO[];
  audit: Audit;
}

export interface CreateUserDTO {
  id?: UUID;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  description?: string;
  positions?: JobPositionEnum[] | [];
}

export interface UserWithLocationDTO {
  userLocationId: UUID;
  id: UUID;
  name: string;
  email: string;
  role: RoleDTO | null;
  activeLocation: boolean;
}
