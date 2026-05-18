import { RoleEnum } from "@/constants";
import { UserWithLocationDTO } from "@/features/users/dto/user.dto";
import { Audit } from "@/types/audit.types";
import { ISODateTimeString, UUID } from "@/types/common";

export interface LocationWithRoleDTO {
  id: string;
  name: string;
  role: RoleEnum;
}

export interface LocationDTO {
  id: UUID;
  name: string;
}

export interface LocationSimpleDTO {
  id: UUID;
  name: string;
  active: boolean;
}

export interface AdminsLocationPageItemDTO {
  id: UUID;
  name: string;
}

export interface LocationPageItemDTO {
  id: UUID;
  name: string;
  address: string | null;
  active: boolean;
  admins: AdminsLocationPageItemDTO[];
  createdAt: ISODateTimeString | null;
}

export interface CreateLocationDTO {
  id?: UUID;
  name: string;
  address?: string;
}
export interface LocationStatsDTO {
  totalActiveUsers: number;
  activeShift: {
    isOpen: boolean;
    openedBy: {
      id: UUID;
      name: string;
    };
    openedAt: ISODateTimeString;
  };
}

export interface LocationDetailDTO {
  id: UUID;
  name: string;
  address: string | null;
  active: boolean;
  users: UserWithLocationDTO[] | [];
  stats: LocationStatsDTO | null;
  audit: Audit;
}
