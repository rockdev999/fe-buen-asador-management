import { CategoryShortDTO } from "@/features/categories/dto/cateogory.dto";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ProductDTO {
  id: UUID;
  name: string;
  price: number;
  isQuantifiable: boolean;
  category: CategoryShortDTO;
  locationId: UUID;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
