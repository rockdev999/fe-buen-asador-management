import { LocationDTO } from "@/features/locations/dto/location.dto";

/** Sucursal del producto con su disponibilidad y precio en ella. */
export interface ProductLocationDTO extends LocationDTO {
  available: boolean;
  /** Precio propio de la sucursal; null = usa el precio general. */
  price: number | null;
  /** Lo que se cobra en esa sucursal (propio o general). */
  effectivePrice: number;
}

/** Precio propio de una sucursal al crear/editar; null = vuelve al general. */
export interface ProductLocationPriceDTO {
  locationId: UUID;
  price: number | null;
}
import { CategoryShortDTO } from "@/features/catalog/categories/dto/cateogory.dto";
import { UUID } from "@/types/common";
import { Audit } from "@/types/audit.types";

export interface ProductDTO {
  id: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  /** Precio en la sucursal consultada (?locationId= o la del usuario); sin sucursal = general. */
  price: number;
  /** Precio general (el que se edita). */
  basePrice: number;
  available: boolean;
  isQuantifiable: boolean;
  sortOrder: number;
  haveModifiers: boolean;
  category: CategoryShortDTO;
  locations: ProductLocationDTO[];
  audit: Audit;
}

export interface ProductPageItemDTO {
  id: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  /** Precio en la sucursal consultada (?locationId= o la del usuario); sin sucursal = general. */
  price: number;
  /** Precio general (el que se edita). */
  basePrice: number;
  available: boolean;
  isQuantifiable: boolean;
  haveModifiers: boolean;
  sortOrder: number;
  category: CategoryShortDTO;
  locations: ProductLocationDTO[] | [];
}

export interface CreateProductDTO {
  id?: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  available: boolean;
  isQuantifiable: boolean;
  sortOrder: number;
  haveModifiers: boolean;
  categoryId: UUID;
  locationIds: UUID[];
  /**
   * Si se envía, reemplaza todos los precios por sucursal (una sucursal no
   * listada o con price null vuelve al general). Si se omite, no cambian.
   */
  locationPrices?: ProductLocationPriceDTO[];
}
