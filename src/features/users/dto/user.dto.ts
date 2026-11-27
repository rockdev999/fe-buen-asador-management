import { RoleEnum } from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { ISODateTimeString, UUID } from "@/types/common";
import { RoleDTO } from "./role.dto";
import { Audit } from "@/types/audit.types";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";
import { CredentialsEmailStatusEnum } from "@/constants/enums/user.enum";

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
  location: LocationDTO | null;
  /** Solo en respuestas de sesión (select-location / refresh). */
  mustChangePassword?: boolean;
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
  credentialsEmailStatus?: CredentialsEmailStatusEnum | null;
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
  credentialsEmailStatus?: CredentialsEmailStatusEnum | null;
  credentialsEmailSentAt?: ISODateTimeString | null;
}

export interface CreateUserDTO {
  id?: UUID;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
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

export interface UserSimpleDTO {
  id: UUID;
  name: string;
  username: string;
  positions?: JobPositionEnum[] | [];
  locations: UserLocationItemDTO[] | [];
}

export interface CreatedUserDTO {
  id: UUID;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  credentialsEmailStatus: CredentialsEmailStatusEnum;
  credentialsEmailSentAt: ISODateTimeString | null;
}

/** Respuesta de POST /users/:id/reset-password. */
export interface ResetPasswordResponseDTO {
  userId: UUID;
  email: string;
  credentialsEmailStatus: CredentialsEmailStatusEnum;
}
