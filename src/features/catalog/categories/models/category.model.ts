import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface Category {
  id?: UUID;
  name: string;
  sortOrder: string;
  audit: Audit | null;
}

export interface CategoryShort {
  id: UUID;
  name: string;
  sortOrder?: number;
}

export interface CategoryProduct {
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

export interface MenuCategory {
  id: UUID;
  name: string;
  sortOrder: number;
  products: CategoryProduct[];
}
