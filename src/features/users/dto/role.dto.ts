import { RoleEnum } from "@/constants";
import { UUID } from "@/types/common";

export interface RoleDTO {
  id: UUID;
  name: RoleEnum;
}
