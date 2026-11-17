import { CategoryShort } from "@/features/catalog/categories/models/category.model";
import { Location } from "@/features/locations/models/location.model";

/** Sucursal del producto con su disponibilidad y precio en ella. */
export interface ProductLocation extends Location {
  available: boolean;
  /** Precio propio de la sucursal; null = usa el precio general. */
  price: number | null;
  /** Lo que se cobra en esa sucursal (propio o general). */
  effectivePrice: number;
}
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface Product {
  id: UUID;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  /** Precio en la sucursal consultada; sin sucursal = general. */
  price: number;
  /** Precio general (el que se edita en el formulario). */
  basePrice: number;
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
  /** Precio en la sucursal consultada; sin sucursal = general. */
  price: number;
  /** Precio general. */
  basePrice: number;
  available: boolean;
  isQuantifiable: boolean;
  haveModifiers: boolean;
  sortOrder: number;
  category: CategoryShort;
  locations: ProductLocation[];
}
