import { UUID } from "@/types/common";

export interface Category {
  id: UUID;
  name: string;
  createdAt: Date | null;
  updatedAt?: Date | null;
}

export interface CategoryShort {
  id: UUID;
  name: string;
}
