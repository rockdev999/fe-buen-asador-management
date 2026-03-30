import { RoleEnum } from "@/constants";
import { UUID } from "@/types/common";

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
