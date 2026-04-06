import { CategoryShort } from "@/features/categories/models/category.model";
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
  category: CategoryShort;
  locationId: UUID;
  createdAt: Date | null;
  updatedAt?: Date | null;
}
