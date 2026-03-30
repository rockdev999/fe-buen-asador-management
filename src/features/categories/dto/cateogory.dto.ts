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
