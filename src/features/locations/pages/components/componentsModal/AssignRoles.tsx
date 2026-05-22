import {
  UserRoleAssigner,
  UserRoleAssignment,
} from "@/components/shared/Interactives/UserRoleAssigner";
import { RoleEnum } from "@/constants";
import { Role } from "@/features/users/models/role.model";
import { UserWithLocation } from "@/features/users/models/user.model";
import { ROLE_LABELS } from "@/utils/generalStatus/role-display";
import { useMemo, useState } from "react";

interface AssignRolesProps {
  users: UserWithLocation[] | null;
  roles: Role[] | null;
}

export const AssignRoles = ({ users, roles }: AssignRolesProps) => {
  // Estado
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);

  // Opciones
  const userOptions = useMemo(
    () =>
      (users ?? []).map((u) => ({
        id: u.id,
        label: u.name,
        sublabel: u.email,
      })),
    [users],
  );

  const roleOptions = useMemo(
    () =>
      (roles ?? []).map((r) => ({
        id: r.id,
        label: ROLE_LABELS[r.name as RoleEnum] ?? r.name,
      })),
    [roles],
  );

  // Excluir usuarios ya asignados a la sucursal
  //   const alreadyAssignedIds = useMemo(
  //     () =>
  //       location?.users.filter((u) => u.activeLocation).map((u) => u.id) ?? [],
  //     [location],
  //   );

  return (
    <UserRoleAssigner
      users={userOptions}
      roles={roleOptions}
      value={assignments}
      onChange={setAssignments}
      //   excludeUserIds={alreadyAssignedIds}
      //   isLoadingUsers={loadingUsers}
      //   isLoadingRoles={loadingRoles}
    />
  );
};
