import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";

export const LOCATION_DROPDOWNS: FilterDropdown[] = [
  {
    key: "active",
    placeholder: "Estado",
    options: [
      { label: "Activo", value: "true" },
      { label: "Inactivo", value: "false" },
    ],
  },
];
