import { LocationDTO } from "@/features/locations/dto/location.dto";
import { CategoryShortDTO } from "@/features/catalog/categories/dto/cateogory.dto";
import { UUID } from "@/types/common";
import { Audit } from "@/types/audit.types";

export interface ProductDTO {
  id: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  available: boolean;
  isQuantifiable: boolean;
  sortOrder: number;
  haveModifiers: boolean;
  category: CategoryShortDTO;
  locations: LocationDTO[];
  audit: Audit;
}

export interface ProductPageItemDTO {
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
  category: CategoryShortDTO;
  locations: LocationDTO[] | [];
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
}
