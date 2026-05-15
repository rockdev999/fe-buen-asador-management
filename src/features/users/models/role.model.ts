import { RoleEnum } from "@/constants";
import { UUID } from "@/types/common";

export interface Role {
  id: UUID;
  name: RoleEnum;
}
