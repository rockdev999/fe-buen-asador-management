import { Location } from "@/features/locations/models/location.model";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface Modifier {
  id: UUID;
  name: string;
  extraPrice: number;
  active: boolean;
  locations: Location[];
  audit: Audit;
}
