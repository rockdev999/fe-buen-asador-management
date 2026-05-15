import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";
import { RoleEnum } from "@/constants";
import { ROLE_LABELS } from "@/utils/generalStatus/role-display";

export const USER_DROPDOWNS: FilterDropdown[] = [
  {
    key: "active",
    placeholder: "Estado",
    options: [
      { label: "Activo", value: "true" },
      { label: "Inactivo", value: "false" },
    ],
  },
  {
    key: "role",
    placeholder: "Rol",
    options: Object.values(RoleEnum).map((r) => ({
      label: ROLE_LABELS[r],
      value: r,
    })),
  },
];
