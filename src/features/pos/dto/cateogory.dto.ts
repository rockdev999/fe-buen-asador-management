import { ISODateTimeString, UUID } from "@/types/common";

export interface CategoryDTO {
  id: UUID;
  name: string;
  locationId: UUID;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface CategoryShortDTO {
  id: UUID;
  name: string;
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
