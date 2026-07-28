import { LocationDTO } from "@/features/locations/dto/location.dto";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface CategoryDTO {
  id: UUID;
  name: string;
  sortOrder: number;
  locations: LocationDTO[];
  audit: Audit;
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
