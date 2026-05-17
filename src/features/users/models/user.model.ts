import { RoleEnum } from "@/constants";
import { ISODateTimeString, UUID } from "@/types/common";
import { Role } from "./role.model";
import { Audit } from "@/types/audit.types";
import { Location } from "@/features/locations/models/location.model";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

export interface User {
  id: UUID;
  name: string;
  email: string;
}

export interface UserDetails {
  id: UUID;
  name: string;
  email: string;
  role: RoleEnum;
  locationId: UUID;
  locationName: string;
}

export interface UserShort {
  id: UUID;
  name: string;
}

export interface UserLocationItem {
  id: UUID;
  name: string;
  role: Role | null;
}

export interface UserPageItem {
  id: UUID;
  name: string;
  username: string;
  email: string;
  phone?: string;
  positions?: JobPositionEnum[] | [];
  active: boolean;
  createdAt: ISODateTimeString;
  locations: UserLocationItem[] | null;
}

export interface UserLocation {
  id: UUID;
  location: Location;
  role: Role | null;
  activeLocation: boolean;
}

export interface UserLocations {
  id: UUID;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  active: boolean;
  description?: string;
  positions?: JobPositionEnum[] | [];
  locations: UserLocation[];
  audit: Audit;
}
