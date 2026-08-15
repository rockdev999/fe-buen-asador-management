import { SortDirectionEnum } from "../enums/sort.enum";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PER_PAGE: 100,
} as const;

export interface TableSorting {
  columnKey: string;
  direction: SortDirectionEnum;
}

export interface TableConfig {
  id: string;
  defaultSorting: TableSorting;
  limit: number;
  showPagination?: boolean;
  showResults?: boolean;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  urlWithArgs?: (...args: any[]) => string;
}

type TableKey =
  | "ORDERS"
  | "SALES"
  | "USERS"
  | "LOCATIONS"
  | "PRODUCTS"
  | "INGREDIENTS";

type DataTableConfig = Record<TableKey, TableConfig>;

export const DATA_TABLE: DataTableConfig = {
  ORDERS: {
    id: "dt-orders",
    defaultSorting: {
      columnKey: "updatedAt",
      direction: SortDirectionEnum.DESC,
    },
    limit: 10,
    showPagination: true,
    showResults: true,
    url: "/orders",
  },

  SALES: {
    id: "dt-sales",
    defaultSorting: {
      columnKey: "createdAt",
      direction: SortDirectionEnum.DESC,
    },
    limit: 10,
    showPagination: true,
    showResults: true,
    url: "/sales",
  },

  USERS: {
    id: "dt-users",
    defaultSorting: {
      columnKey: "name",
      direction: SortDirectionEnum.ASC,
    },
    limit: 10,
    showPagination: true,
    showResults: true,
    url: "/users",
  },

  LOCATIONS: {
    id: "dt-locations",
    defaultSorting: {
      columnKey: "name",
      direction: SortDirectionEnum.ASC,
    },
    limit: 10,
    showPagination: true,
    showResults: true,
    url: "/locations",
  },

  PRODUCTS: {
    id: "dt-products",
    defaultSorting: {
      columnKey: "",
      direction: SortDirectionEnum.ASC,
    },
    limit: 10,
    showPagination: true,
    showResults: true,
    url: "/products",
  },

  INGREDIENTS: {
    id: "dt-ingredients",
    defaultSorting: {
      columnKey: "name",
      direction: SortDirectionEnum.ASC,
    },
    limit: 10,
    showPagination: true,
    showResults: true,
    url: "/ingredients",
  },
};
