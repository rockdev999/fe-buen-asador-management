import { SortDirectionEnum } from "@/constants/enums/sort.enum";

export type SortDirection = SortDirectionEnum | null;

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render: (row: T) => React.ReactNode;
}

export interface TableMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
