import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";
import { RoleEnum } from "@/constants";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";
import { JOB_POSITION_LABELS } from "@/utils/generalStatus/job-display";
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
  {
    key: "positions",
    placeholder: "Cargo",
    options: Object.values(JobPositionEnum).map((pos) => ({
      label: JOB_POSITION_LABELS[pos],
      value: pos,
    })),
  },
];
