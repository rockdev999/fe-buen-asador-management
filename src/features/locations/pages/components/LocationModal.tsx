import { UUID } from "@/types/common";
import { useMemo, useState } from "react";
import {
  useActivateLocation,
  useAssignUsersToLocation,
  useCreateLocation,
  useDeactivateLocation,
  useDeactivateUserByLocation,
  useGetLocation,
  useUpdateLocation,
} from "../../hooks/useLocation";
import { CreateLocationForm } from "../../validators/location.schema";
import { LocationFormConfig } from "../../forms/location.form-config";
import { useFormik } from "formik";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { LocationModalSkeleton } from "./LocationModalSkeleton";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import {
  AlertTriangle,
  Building2,
  Check,
  MapPin,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { FormSection } from "@/components/shared/Form/FormSection";
import { StepCard } from "./StepCard";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import {
  useGetRoles,
  useGetUsersSimple,
} from "@/features/users/hooks/useUsers";
import { FormInput } from "@/components/shared/Form/FormInput";
import { ROLE_COLORS, ROLE_LABELS } from "@/utils/generalStatus/role-display";
import { cn } from "@/lib/utils";
import { RoleEnum } from "@/constants";
import {
  UserRoleAssigner,
  UserRoleAssignment,
} from "@/components/shared/Interactives/UserRoleAssigner";
import { JOB_POSITION_LABELS } from "@/utils/generalStatus/job-display";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

interface LocationModalProps {
  locationId?: UUID | null;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2;

export const LocationModal = ({
  locationId,
  onClose,
  onSuccess,
}: LocationModalProps) => {
  const isEdit = !!locationId;
  const [step, setStep] = useState<Step>(1);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [createdLocationId, setCreatedLocationId] = useState<string | null>(
    null,
  );
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);

  // El locationId real — puede venir de props (edit) o del recién creado
  const activeLocationId = locationId ?? createdLocationId;

  const {
    data: location,
    status: getLocationStatus,
    refetch: refetchLocation,
  } = useGetLocation(activeLocationId ?? "", { enabled: !!activeLocationId });
  const { data: roles, status: rolesStatus } = useGetRoles();
  const { data: users, status: usersStatus } = useGetUsersSimple();

  const { mutate: createLocation, status: createStatus } = useCreateLocation();
  const { mutate: updateLocation, status: updateStatus } = useUpdateLocation(
    locationId ?? "",
  );
  const { mutate: deactivateLocation, status: deactivateStatus } =
    useDeactivateLocation(locationId ?? "");
  const { mutate: activateLocation, status: activateStatus } =
    useActivateLocation(locationId ?? "");

  const { mutate: assignUsers, status: assignStatus } =
    useAssignUsersToLocation();
  const { mutate: revokeUser, isPending: isRevoking } =
    useDeactivateUserByLocation();

  const isSaving = createStatus === "pending" || updateStatus === "pending";
  const isDeactivating = deactivateStatus === "pending";
  const isAssigning = assignStatus === "pending";

  const initValues: CreateLocationForm = useMemo(() => {
    if (isEdit && location) {
      return { name: location.name, address: location.address ?? "" };
    }
    return LocationFormConfig.initialValues;
  }, [isEdit, location]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandlerBlur,
    handleChange: formHandleChange,
    handleSubmit: formHandleSubmit,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<CreateLocationForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: isEdit
      ? LocationFormConfig.validationSchemaUpdate
      : LocationFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = LocationFormConfig.mapFormToDTO(data);
      if (isEdit) {
        updateLocation(dto, { onSuccess: () => setStep(2) });
      } else {
        createLocation(dto, {
          onSuccess: (created) => {
            setCreatedLocationId(created.id ?? null);
            setStep(2);
          },
        });
      }
    },
  });

  const alreadyAssignedIds = useMemo(
    () =>
      location?.users.filter((u) => u.activeLocation).map((u) => u.id) ?? [],
    [location],
  );

  const userOptions = useMemo(
    () =>
      (users ?? []).map((u) => ({
        id: u.id,
        label: u.name,
        sublabel:
          u.positions && u.positions?.length > 0
            ? u.positions
                .map((p) => JOB_POSITION_LABELS[p as JobPositionEnum] ?? p)
                .join(", ")
            : u.username,
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

  function handleFinish() {
    const valid = assignments.filter((a) => a.userId && a.roleId);
    if (valid.length > 0 && activeLocationId) {
      assignUsers(
        { locationId: activeLocationId, dto: { users: valid } },
        { onSuccess: onSuccess },
      );
    } else {
      onSuccess();
    }
  }

  function handleDeactivate() {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      setTimeout(() => setConfirmDeactivate(false), 3000);
    } else {
      deactivateLocation(undefined, { onSuccess });
    }
  }

  const handleActivate = () => {
    activateLocation(undefined, {
      onSuccess: () => {
        refetchLocation();
      },
    });
  };

  if (isEdit && getLocationStatus === "pending") {
    return (
      <AppModal
        size="lg"
        maxHeightClassName="max-h-[85vh]"
        contentClassName="max-w-lg"
      >
        <LocationModalSkeleton />
      </AppModal>
    );
  }

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[88vh]">
      <PanelHeader
        icon={Building2}
        title={isEdit ? "Editar sucursal" : "Crear sucursal"}
        description={
          isEdit ? "Gestiona datos y usuarios." : "Registra una nueva sucursal."
        }
        onClose={onClose}
      />

      <form
        onSubmit={formHandleSubmit}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto">
          {/* Steps */}
          <div className="shrink-0 border-b border-surface px-5 py-3">
            <div className="grid grid-cols-2 gap-3">
              <StepCard
                active={step === 1}
                done={false}
                icon={<Building2 size={14} />}
                onClick={() => setStep(1)}
                title="Datos de sucursal"
                description="Nombre y dirección"
              />
              <StepCard
                active={step === 2}
                done={false}
                icon={<Users size={14} />}
                onClick={() => (step === 2 || !!activeLocationId) && setStep(2)}
                title="Usuarios y roles"
                description="Asignación inicial"
                disabled={!isEdit && !activeLocationId}
              />
            </div>
          </div>

          <div className="px-5 py-2">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <FormSection
                title="Información de la sucursal"
                description="Estos datos identificarán la sucursal dentro del sistema."
              >
                <div className="space-y-3">
                  <FormInput
                    required
                    id="name"
                    name="name"
                    label="Nombre de la sucursal"
                    icon={Building2}
                    value={formValues.name}
                    onChange={formHandleChange}
                    onBlur={formHandlerBlur}
                    placeholder="Ej: Sucursal Zona Sur"
                    touched={formTouched.name}
                    error={formErrors.name}
                    className="h-9 rounded-xl bg-white text-[13px]"
                  />
                  <FormInput
                    required
                    id="address"
                    name="address"
                    label="Dirección"
                    icon={MapPin}
                    value={formValues.address}
                    onChange={formHandleChange}
                    onBlur={formHandlerBlur}
                    placeholder="Ej: Av. Siempre Viva 123"
                    touched={formTouched.address}
                    error={formErrors.address}
                    className="h-9 rounded-xl bg-white text-[13px]"
                  />
                </div>

                {isEdit && !location?.active && (
                  <section className="mt-0 rounded-xl border border-green-100 bg-green-50/50 p-3">
                    <div className="flex items-start gap-2">
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-green-500"
                      />
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold text-green-700">
                          Activar sucursal
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-green-600/80">
                          La sucursal volverá a estar operativa.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleActivate}
                        isLoading={activateStatus === "pending"}
                        className="mt-3 border-green-200 bg-white text-green-600 hover:bg-green-100"
                      >
                        Activar sucursal
                      </Button>
                    </div>
                  </section>
                )}

                {/* Danger zone — solo edición */}
                {isEdit && location?.active && (
                  <section className="mt-0 rounded-xl border border-red-100 bg-red-50/50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        size={15}
                        className="mt-0.5 shrink-0 text-red-500"
                      />
                      <div className="flex">
                        <div className="flex-1">
                          <p className="text-[12px] font-semibold text-red-700">
                            Desactivar sucursal
                          </p>
                          <p className="mt-1 text-[11px] leading-4 text-red-600/80">
                            La sucursal quedará inactiva y no podrá operar hasta
                            reactivarla.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={confirmDeactivate ? "danger" : "outline"}
                          size="sm"
                          onClick={handleDeactivate}
                          isLoading={isDeactivating}
                          className={cn(
                            "mt-3",
                            !confirmDeactivate &&
                              "border-red-200 bg-white text-red-600 hover:bg-red-100",
                          )}
                        >
                          {confirmDeactivate
                            ? "Confirmar desactivación"
                            : "Desactivar sucursal"}
                        </Button>
                      </div>
                    </div>
                  </section>
                )}
              </FormSection>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Resumen sucursal */}
                {/* <div className="rounded-xl border border-green-100 bg-green-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <Check size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-inkblack">
                        {location?.name ?? formValues.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {location?.address ?? formValues.address}
                      </p>
                    </div>
                  </div>
                </div> */}

                {/* Asignar nuevos usuarios */}
                <FormSection
                  title="Asignar usuarios"
                  description="Selecciona usuarios y el rol que tendrán en esta sucursal."
                  icon={UserPlus}
                  className="rounded-xl border border-surface bg-surface/20 p-4"
                >
                  <UserRoleAssigner
                    users={userOptions}
                    roles={roleOptions}
                    value={assignments}
                    onChange={setAssignments}
                    excludeUserIds={alreadyAssignedIds}
                    isLoadingUsers={usersStatus === "pending"}
                    isLoadingRoles={rolesStatus === "pending"}
                  />
                </FormSection>

                {/* Usuarios ya asignados */}
                <div className="rounded-xl border border-surface bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-inkblack">
                        Usuarios asignados
                      </p>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground">
                      {location?.users.filter((u) => u.activeLocation).length ??
                        0}
                    </span>
                  </div>

                  {!location?.users.filter((u) => u.activeLocation).length ? (
                    <div className="rounded-xl border border-dashed border-surface bg-surface/30 px-4 py-1 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-muted-foreground shadow-sm">
                        <Users size={16} />
                      </div>
                      <p className="mt-3 text-[12px] font-medium text-inkblack">
                        Sin usuarios asignados
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Puedes asignarlos ahora o más adelante.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {location?.users
                        .filter((u) => u.activeLocation)
                        .map((u) => (
                          <div
                            key={u.userLocationId}
                            className="flex items-center justify-between gap-3 rounded-xl border border-surface bg-surface/30 px-3 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-muted-foreground shadow-sm">
                                <Users size={13} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[12px] font-medium text-inkblack">
                                  {u.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                  ROLE_COLORS[u.role?.name as RoleEnum] ??
                                    "bg-surface text-muted-foreground",
                                )}
                              >
                                {ROLE_LABELS[u.role?.name as RoleEnum] ??
                                  u.role?.name}
                              </span>

                              <button
                                type="button"
                                disabled={isRevoking}
                                onClick={() =>
                                  revokeUser(
                                    {
                                      locationId: activeLocationId!,
                                      userId: u.id,
                                    },
                                    { onSuccess: () => refetchLocation() },
                                  )
                                }
                                className="w-6 h-6 rounded-lg flex items-center justify-center  hover:text-red-500 hover:bg-red-50 transition-colors group-hover:opacity-100"
                                title="Quitar de esta sucursal"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <PanelFooter>
          {step === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={isEdit ? !formDirty || isSaving : isSaving}
                loadingText={isEdit ? "Guardando..." : "Creando..."}
              >
                {isEdit ? "Actualizar y continuar" : "Crear y continuar"}
              </Button>
            </>
          ) : (
            <>
              <div></div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onSuccess}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleFinish}
                  isLoading={isAssigning}
                >
                  Finalizar
                </Button>
              </div>
            </>
          )}
        </PanelFooter>
      </form>
    </AppModal>
  );
};
