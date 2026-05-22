import { UUID } from "@/types/common";

export interface ModifierDTO {
  id: UUID;
  name: string;
  extraPrice: number;
  active: boolean;
  locationId: UUID;
  createdAt: string;
  updatedAt: string;
}
