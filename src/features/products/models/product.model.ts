import { CategoryShort } from "@/features/categories/models/category.model";
import { UUID } from "@/types/common";

export interface Product {
  id: UUID;
  name: string;
  price: number;
  isQuantifiable: boolean;
  category: CategoryShort;
  locationId: UUID;
  createdAt: Date | null;
  updatedAt?: Date | null;
}
