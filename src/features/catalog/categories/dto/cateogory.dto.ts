import { LocationDTO } from "@/features/locations/dto/location.dto";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface CategoryDTO {
  id: UUID;
  name: string;
  sortOrder: number;
  locations: LocationDTO[];
  /** Productos en el alcance del ?locationId con que se pidió el listado. */
  productsCount: number;
  /** Disponibles (global Y en la sucursal; sin sucursal: en todas). */
  availableProductsCount: number;
  audit: Audit;
}

/** Respuesta de PATCH /categories/:id/availability. */
export interface CategoryAvailabilityResponseDTO {
  category: CategoryDTO;
  available: boolean;
  /** Productos que efectivamente cambiaron. */
  affectedProducts: number;
  /** Sucursal afectada; null = todas. */
  location: LocationDTO | null;
}

export interface CategoryShortDTO {
  id: UUID;
  name: string;
  sortOrder: number;
}

export interface CategoryProductDTO {
  id: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  available: boolean;
  isQuantifiable: boolean;
  haveModifiers: boolean;
  sortOrder: number;
}

export interface MenuCategoryDTO {
  id: UUID;
  name: string;
  sortOrder: number;
  products: CategoryProductDTO[];
}

export interface CreateCategoryDTO {
  id?: UUID;
  name: string;
  sortOrder: number;
  locationIds: UUID[];
}
