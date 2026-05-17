import {
  UserCheck,
  Building2,
  User,
  Mail,
  AlertTriangle,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  useCreateUser,
  useDeactivateUser,
  useGetUserWithLocations,
  useUpdateUser,
} from "../../hooks/useUsers";
import { useFormik } from "formik";
import { UserFormConfig } from "../../forms/user.form-config";
import { Button } from "@/components/shared/Basics/Button";
import { UUID } from "@/types/common";
import { ROLE_COLORS, ROLE_LABELS } from "@/utils/generalStatus/role-display";
import { RoleEnum } from "@/constants";
import { Label } from "@/components/shared/Basics/Label";
import { FormField } from "@/components/shared/Basics/FormField";
import { CreateUserForm } from "../../validators/user.schema";
import { UserModalSkeleton } from "./UserModalSkeleton";
import { MultiSelectDropdown } from "@/components/shared/Interactives/MultiSelectDropdown";
import { JOB_POSITION_OPTIONS } from "@/utils/generalStatus/job-display";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { FormSection } from "@/components/shared/Form/FormSection";
import { FormInput } from "@/components/shared/Form/FormInput";
import { FormTextarea } from "@/components/shared/Form/FormTextarea";
import { FormPassword } from "@/components/shared/Form/FormPassword";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";

interface UserModalProps {
  userId?: UUID | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal = ({ userId, onClose, onSuccess }: UserModalProps) => {
  const isEdit = !!userId;
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const { data: user, status: getUserStatus } = useGetUserWithLocations(
    userId ?? "",
    { enabled: isEdit },
  );
  const { mutate: createUser, status: createStatus } = useCreateUser();
  const { mutate: updateUser, status: updateStatus } = useUpdateUser(
    userId ?? "",
  );
  const { mutate: deactivateUser, status: deactivateStatus } =
    useDeactivateUser(userId ?? "");

  const isSaving = createStatus === "pending" || updateStatus === "pending";
  const isDeactivating = deactivateStatus === "pending";

  const activeLocations =
    user?.locations.filter((location) => location.activeLocation) ?? [];

  const initValues: CreateUserForm = useMemo(() => {
    if (isEdit && user) {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        password: "",
        repitPassword: "",
        description: user.description,
        positions: user.positions,
      };
    }
    return UserFormConfig.initialValues;
  }, [isEdit, user]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandlerBlur,
    handleChange: formHandleChange,
    handleSubmit: formHandleSubmit,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<CreateUserForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: isEdit
      ? UserFormConfig.validationSchemaUpdate
      : UserFormConfig.validationSchemaCreate,
    onSubmit: (data: CreateUserForm) => {
      const dto = UserFormConfig.mapFormToDTO(data, isEdit);
      if (isEdit) {
        updateUser(dto, { onSuccess: onSuccess });
      } else {
        createUser(dto, { onSuccess: onSuccess });
      }
    },
  });

  const handleDeactivate = () => {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true);
      setTimeout(() => setConfirmDeactivate(false), 3000);
    } else {
      deactivateUser(undefined, {
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };

  if (isEdit && getUserStatus === "pending") {
    return (
      <AppModal
        size="lg"
        maxHeightClassName="max-h-[85vh]"
        contentClassName="max-w-lg"
      >
        <UserModalSkeleton />
      </AppModal>
    );
  }

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[88vh]">
      {/* Header */}
      <PanelHeader
        icon={UserCheck}
        title={isEdit ? "Editar usuario" : "Nuevo usuario"}
        description={
          isEdit ? user?.email : "Completa los datos para crear un usuario"
        }
        onClose={onClose}
      />
      <form
        onSubmit={formHandleSubmit}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Datos del usuario */}
          <FormSection icon={UserCheck} title="Datos del usuario">
            {/* Nombres y apellidos */}
            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput
                required
                id="firstName"
                name="firstName"
                label="Nombres"
                icon={User}
                value={formValues.firstName}
                onChange={formHandleChange}
                onBlur={formHandlerBlur}
                placeholder="Ej: Juan"
                touched={formTouched.firstName}
                error={formErrors.firstName}
                className="h-9 rounded-xl bg-white text-[13px]"
              />

              <FormInput
                required
                id="lastName"
                name="lastName"
                label="Apellidos"
                icon={User}
                value={formValues.lastName}
                onChange={formHandleChange}
                onBlur={formHandlerBlur}
                placeholder="Ej: Pérez"
                touched={formTouched.lastName}
                error={formErrors.lastName}
                className="h-9 rounded-xl bg-white text-[13px]"
              />
            </div>

            {/* Nombre de usuario */}
            <FormInput
              required
              id="username"
              name="username"
              label="Nombre de usuario"
              icon={UserCheck}
              value={formValues.username}
              onChange={formHandleChange}
              onBlur={formHandlerBlur}
              placeholder="Ej: juan.perez"
              touched={formTouched.username}
              error={formErrors.username}
              className="h-9 rounded-xl bg-white text-[13px]"
            />

            {/* Email */}
            <FormInput
              required
              id="email"
              name="email"
              label="Email"
              icon={Mail}
              type="email"
              value={formValues.email}
              onChange={formHandleChange}
              onBlur={formHandlerBlur}
              placeholder="Ej: juan@buenasador.com"
              touched={formTouched.email}
              error={formErrors.email}
              className="h-9 rounded-xl bg-white text-[13px]"
            />

            <FormTextarea
              id="description"
              name="description"
              label="Descripción"
              icon={FileText}
              value={formValues.description ?? ""}
              onChange={formHandleChange}
              onBlur={formHandlerBlur}
              placeholder="Ej: Usuario encargado de caja, atención al cliente o administración."
              rows={3}
              maxLength={200}
              showCounter
              touched={formTouched.description}
              error={formErrors.description}
              className="rounded-xl bg-white text-[13px]"
            />

            <FormField>
              <Label>Cargos de trabajo</Label>
              <div
                className={cn(
                  "rounded-xl border bg-surface/20 p-3",
                  formTouched.positions && formErrors.positions
                    ? "border-red-300"
                    : "border-surface",
                )}
              >
                <div className="mb-0 flex items-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <BriefcaseBusiness size={14} />
                  </div>
                  <FormField className="w-full">
                    <MultiSelectDropdown
                      options={JOB_POSITION_OPTIONS}
                      value={formValues.positions ?? []}
                      onChange={(vals) =>
                        formHandleChange({
                          target: { name: "positions", value: vals },
                        })
                      }
                      placeholder="Seleccionar cargos..."
                      error={formErrors.positions as string}
                      touched={formTouched.positions as boolean}
                    />
                  </FormField>
                </div>
              </div>
            </FormField>

            {/* Contraseña — solo en creación */}
            {!isEdit && (
              <div className="grid gap-3 sm:grid-cols-2">
                <FormPassword
                  required
                  id="password"
                  name="password"
                  label="Contraseña"
                  value={formValues.password}
                  onChange={formHandleChange}
                  onBlur={formHandlerBlur}
                  placeholder="Mínimo 8 caracteres"
                  touched={formTouched.password}
                  error={formErrors.password}
                  className="h-9 rounded-xl bg-white text-[13px]"
                />

                <FormPassword
                  required
                  id="repitPassword"
                  name="repitPassword"
                  label="Repetir contraseña"
                  value={formValues.repitPassword}
                  onChange={formHandleChange}
                  onBlur={formHandlerBlur}
                  placeholder="Confirma la contraseña"
                  touched={formTouched.repitPassword}
                  error={formErrors.repitPassword}
                  className="h-9 rounded-xl bg-white text-[13px]"
                />
              </div>
            )}
          </FormSection>

          {/* Sucursales y roles — solo edición */}
          {isEdit && (
            <FormSection
              icon={Building2}
              title="Sucursales y roles"
              description="Sucursales activas donde este usuario tiene acceso."
              className="mt-5 border-t border-surface pt-4"
              rightContent={
                <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  {activeLocations.length} asignada
                  {activeLocations.length === 1 ? "" : "s"}
                </span>
              }
            >
              {activeLocations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-surface bg-surface/30 px-4 py-5 text-center">
                  <p className="text-[12px] font-medium text-inkblack">
                    Sin sucursales asignadas
                  </p>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Este usuario todavía no tiene accesos activos.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeLocations.map((userLocation) => (
                    <div
                      key={userLocation.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-surface bg-surface/30 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-muted-foreground shadow-sm">
                          <Building2 size={13} />
                        </div>

                        <span className="truncate text-[12px] font-medium text-inkblack">
                          {userLocation.location.name}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          ROLE_COLORS[userLocation.role?.name as RoleEnum] ??
                            "bg-surface text-muted-foreground",
                        )}
                      >
                        {ROLE_LABELS[userLocation.role?.name as RoleEnum] ??
                          userLocation.role?.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>
          )}

          {/* Danger zone */}
          {isEdit && user?.active && (
            <section className="mt-5 rounded-xl border border-red-100 bg-red-50/50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-red-700">
                    Desactivar usuario
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-red-600/80">
                    El usuario no podrá iniciar sesión, pero se conservará su
                    historial y registros asociados.
                  </p>

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
                      confirmDeactivate &&
                        "border-red-300 bg-red-100 text-red-700 hover:bg-red-200",
                    )}
                  >
                    {confirmDeactivate
                      ? "Confirmar desactivación"
                      : "Desactivar usuario"}
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <PanelFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            type="submit"
            isLoading={isSaving}
            disabled={isEdit ? !formDirty || isSaving : isSaving}
            loadingText={isEdit ? "Guardando..." : "Creando..."}
          >
            {isEdit ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </PanelFooter>
      </form>
    </AppModal>
  );
};
