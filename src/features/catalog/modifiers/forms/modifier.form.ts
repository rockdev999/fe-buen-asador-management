import { UUID } from "@/types/common";

export interface ModifierForm {
  id?: UUID;
  name: string;
  extraPrice: number;
  active?: boolean;
  locationIds: UUID[];
}
