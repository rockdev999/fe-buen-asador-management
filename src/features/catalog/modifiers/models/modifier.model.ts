import { Location } from "@/features/locations/models/location.model";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

/** Sucursal del modificador con su precio extra en ella. */
export interface ModifierLocation extends Location {
  /** Precio extra propio de la sucursal; null = usa el general (0 = gratis). */
  extraPrice: number | null;
  /** Lo que se cobra en esa sucursal (propio o general). */
  effectiveExtraPrice: number;
}

export interface Modifier {
  id: UUID;
  name: string;
  /** Con sucursal: el de esa sucursal; sin sucursal: el general. */
  extraPrice: number;
  /** Precio extra general (el que se edita en el formulario). */
  baseExtraPrice: number;
  active: boolean;
  locations: ModifierLocation[];
  audit: Audit;
}
