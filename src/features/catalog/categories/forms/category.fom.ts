import { UUID } from "@/types/common";

export interface CategoryForm {
  id?: UUID;
  name: string;
  sortOrder: number;
}
