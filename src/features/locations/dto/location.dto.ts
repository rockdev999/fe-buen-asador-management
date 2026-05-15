import { RoleEnum } from "@/constants";
import { UUID } from "@/types/common";

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
