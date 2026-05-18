import { RoleEnum } from "@/constants";
import { UserWithLocation } from "@/features/users/models/user.model";
import { Audit } from "@/types/audit.types";
import { ISODateTimeString, UUID } from "@/types/common";

export interface LocationWithRole {
  id: UUID;
  name: string;
  role: RoleEnum;
}

export interface Location {
  id: UUID;
  name: string;
}

export interface LocationSimple {
  id: UUID;
  name: string;
  active: boolean;
}

export interface AdminsLocationPageItem {
  id: UUID;
  name: string;
}

export interface LocationPageItem {
  id: UUID;
  name: string;
  address: string | null;
  active: boolean;
  admins: AdminsLocationPageItem[];
  createdAt: ISODateTimeString | null;
}

export interface LocationStats {
  totalActiveUsers: number;
  activeShift: {
    isOpen: boolean;
    openedBy: {
      id: UUID;
      name: string;
    } | null;
    openedAt: ISODateTimeString | null;
  };
}

export interface LocationDetail {
  id: UUID;
  name: string;
  address: string | null;
  active: boolean;
  users: UserWithLocation[] | [];
  stats: LocationStats | null;
  audit: Audit;
}
