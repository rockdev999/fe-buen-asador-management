import { Location } from "@/features/locations/models/location.model";
import { UUID } from "@/types/common";
import { CategoryShort } from "../../categories/models/category.model";

export interface ProductForm {
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
  location: Location;
  category: CategoryShort;
}
