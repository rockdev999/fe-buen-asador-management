import { RoleEnum } from "@/constants";
import { UUID } from "@/types/common";

export interface AuthUser {
  id: UUID;
  name: string;
  email: string;
  role: RoleEnum;
  locationId: UUID;
  locationName: string;
}
