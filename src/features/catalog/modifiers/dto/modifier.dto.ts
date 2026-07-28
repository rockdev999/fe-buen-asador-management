import { LocationDTO } from "@/features/locations/dto/location.dto";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface ModifierDTO {
  id: UUID;
  name: string;
  extraPrice: number;
  active: boolean;
  locations: LocationDTO[];
  audit: Audit;
}

export interface CreateModifierDTO {
  id?: UUID;
  name: string;
  extraPrice: number;
  active?: boolean;
  locationIds: UUID[];
}
