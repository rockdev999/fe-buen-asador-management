import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";

export const PRODUCT_DROPDOWNS: FilterDropdown[] = [
  {
    key: "available",
    placeholder: "Disponibilidad",
    options: [
      { label: "Disponible", value: "true" },
      { label: "No disponible", value: "false" },
    ],
  },
];
