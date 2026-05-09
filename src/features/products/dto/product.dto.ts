import { CategoryShortDTO } from "@/features/categories/dto/cateogory.dto";
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
