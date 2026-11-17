import { LocationDTO } from "@/features/locations/dto/location.dto";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

/** Sucursal del modificador con su precio extra en ella. */
export interface ModifierLocationDTO extends LocationDTO {
  /** Precio extra propio de la sucursal; null = usa el general (0 = gratis). */
  extraPrice: number | null;
  /** Lo que se cobra en esa sucursal (propio o general). */
  effectiveExtraPrice: number;
}

/** Precio extra propio de una sucursal al crear/editar; null = vuelve al general. */
export interface ModifierLocationPriceDTO {
  locationId: UUID;
  extraPrice: number | null;
}

export interface ModifierDTO {
  id: UUID;
  name: string;
  /** Con sucursal (token o ?locationId=): el de esa sucursal; sin sucursal: el general. */
  extraPrice: number;
  /** Precio extra general (el que se edita). */
  baseExtraPrice: number;
  active: boolean;
  locations: ModifierLocationDTO[];
  audit: Audit;
}

export interface CreateModifierDTO {
  id?: UUID;
  name: string;
  extraPrice: number;
  active?: boolean;
  locationIds: UUID[];
  /**
   * Si se envía, reemplaza todos los precios por sucursal (una sucursal no
   * listada o con extraPrice null vuelve al general). Si se omite, no cambian.
   */
  locationPrices?: ModifierLocationPriceDTO[];
}
