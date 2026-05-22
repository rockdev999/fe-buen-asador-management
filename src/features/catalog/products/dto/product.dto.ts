import { LocationDTO } from "@/features/locations/dto/location.dto";
import { CategoryShortDTO } from "@/features/catalog/categories/dto/cateogory.dto";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ProductDTO {
  id: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  available: boolean;
  isQuantifiable: boolean;
  haveModifiers: boolean;
  category: CategoryShortDTO;
  locationId: UUID;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
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
  location: LocationDTO;
}
