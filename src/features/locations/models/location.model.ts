import { RoleEnum } from "@/constants";
import { UUID } from "@/types/common";

export interface LocationWithRole {
  id: UUID;
  name: string;
  role: RoleEnum;
}

export interface Location {
  id: UUID;
  name: string;
}
