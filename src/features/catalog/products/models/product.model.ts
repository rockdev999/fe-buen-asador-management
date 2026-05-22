import { CategoryShort } from "@/features/catalog/categories/models/category.model";
import { Location } from "@/features/locations/models/location.model";
import { UUID } from "@/types/common";

export interface Product {
  id: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  available: boolean;
  isQuantifiable: boolean;
  haveModifiers: boolean;
  category: CategoryShort;
  locationId: UUID;
  createdAt: Date | null;
  updatedAt?: Date | null;
}

export interface ProductPageItem {
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
  category: CategoryShort;
  location: Location;
}
