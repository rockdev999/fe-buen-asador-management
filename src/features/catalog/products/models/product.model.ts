import { CategoryShort } from "@/features/catalog/categories/models/category.model";
import { Location } from "@/features/locations/models/location.model";

/** Sucursal del producto con su disponibilidad en ella. */
export interface ProductLocation extends Location {
  available: boolean;
}
import { Audit } from "@/types/audit.types";
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
  sortOrder: number;
  category: CategoryShort;
  locations: ProductLocation[];
  audit: Audit;
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
  locations: ProductLocation[];
}
