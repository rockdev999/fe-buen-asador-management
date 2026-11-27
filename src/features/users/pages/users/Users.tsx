import { useTableState } from "@/components/shared/DataTable/useTableState";
import { DATA_TABLE, RoleEnum } from "@/constants";
import { useUsersPage } from "../../hooks/useUsers";
import { UserStatusEnum } from "@/constants/enums/user.enum";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { Button } from "@/components/shared/Basics/Button";
import { Plus } from "lucide-react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { USER_DROPDOWNS } from "../../config/user.table";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { getUserColumns } from "./UserColumns";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePasswordReset } from "../../hooks/usePasswordReset";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useState } from "react";
import { UserPageItem } from "../../models/user.model";
import { UserModal } from "../components/UserModal";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

export const Users = () => {
  const {
    page,
    sortKey,
    sortDir,
    filters,
    handleSort,
    handleApply,
    handlePageChange,
  } = useTableState({
    defaultSortKey: DATA_TABLE.USERS.defaultSorting.columnKey,
    defaultSortDir: DATA_TABLE.USERS.defaultSorting.direction,
  });

  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState(filters.locationId ?? "");
  const { data: locations, status: locationsStatus } = useGetLocationSimple();
  const { user: currentUser, isManager } = useAuth();
  const {
    resetPassword,
    resettingUserId,
    statusOverrides,
    trackCredentialsEmail,
  } = usePasswordReset();
  const [resetPasswordUser, setResetPasswordUser] =
    useState<UserPageItem | null>(null);

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useUsersPage({
    page,
    search: filters.search ?? "",
    active: (filters.active as UserStatusEnum) ?? "",
    locationId: filters.locationId ?? "",
    role: (filters.role as RoleEnum) ?? "",
    positions: (filters.positions as JobPositionEnum) ?? "",
    sortKey,
    sortDir,
  });

  const handleOpenCreateModal = () => {
    setSelectedUserId(null);
    setOpenUserModal(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUserId(null);
    setOpenUserModal(false);
  };

  function handleApplyFilters(newFilters: Record<string, string>) {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    handleApply(newFilters);
    if (isSame) refetch();
  }

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] = (
    locations ?? []
  ).map((loc) => ({
    id: loc.id,
    data: loc,
    searchText: loc.name,
    render: (item) => <span>{item.name}</span>,
  }));

  const handleRowClick = (data: UserPageItem) => {
    setSelectedUserId(data.id);
    setOpenUserModal(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Usuarios"
        actions={
          <Button size="sm" onClick={handleOpenCreateModal}>
            <Plus size={13} />
            Nuevo usuario
          </Button>
        }
      />

      <TableFilters
        searchPlaceholder="Buscar por nombre o correo..."
        onApply={handleApplyFilters}
        dropdowns={USER_DROPDOWNS}
        initialValues={filters}
        isLoading={queryStatus === "pending"}
        extraValues={{ locationId }}
        onClearExtra={() => {
          setLocationId("");
        }}
      >
        <AsyncDropdown
          placeholder="Sucursal"
          value={locationId ?? filters.locationId ?? ""}
          onChange={(id) => setLocationId(id)}
          options={locationOptions}
          isLoading={locationsStatus === "pending"}
          emptyText="Sin sucursales"
          searchable
        />
      </TableFilters>

      <DataTable
        columns={getUserColumns({
          currentUserId: currentUser?.id ?? null,
          canResetPassword: isManager,
          statusOverrides,
          resettingUserId,
          onResetPassword: setResetPasswordUser,
          onRetryResetPassword: setResetPasswordUser,
        })}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={(data) => handleRowClick(data)}
        rowKey={(row) => row.id}
        emptyMessage="No hay usuarios"
        emptySubMessage="Crea el primer usuario con el botón de arriba"
      />

      {openUserModal && (
        <UserModal
          userId={selectedUserId}
          onClose={handleCloseUserModal}
          onSuccess={handleCloseUserModal}
          onCreated={(created) => void trackCredentialsEmail(created.id)}
          key={selectedUserId ?? "default"}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          isPending={resettingUserId === resetPasswordUser.id}
          onClose={() => setResetPasswordUser(null)}
          onConfirm={() =>
            resetPassword(resetPasswordUser.id, {
              onSuccess: () => setResetPasswordUser(null),
            })
          }
        />
      )}
    </div>
  );
};
