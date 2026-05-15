// src/features/users/components/UserModal.tsx
import {
  X,
  UserCheck,
  Building2,
  Eye,
  EyeOff,
  User,
  Mail,
  AlertTriangle,
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

interface UserModalProps {
  userId?: UUID | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal = ({ userId, onClose, onSuccess }: UserModalProps) => {
  const isEdit = !!userId;
  const [showPassword, setShowPassword] = useState(false);
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
        name: user.name,
        email: user.email,
        password: "",
        repitPassword: "",
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
    validate: UserFormConfig.validationSchema,
    onSubmit: (data: CreateUserForm) => {
      const dto = UserFormConfig.mapFormToDTO(data);
      if (isEdit) {
        updateUser(dto, {
          onSuccess: () => {
            onSuccess();
          },
        });
      } else {
        createUser(dto, {
          onSuccess: () => {
            onSuccess();
          },
        });
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
      <div className="absolute inset-0 bg-inkblack/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-6">
        <div
          className="bg-white rounded-2xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl"
          style={{ maxHeight: "85vh" }}
        >
          <UserModalSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inkblack/50 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-surface px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <UserCheck size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-inkblack">
                {isEdit ? "Editar usuario" : "Nuevo usuario"}
              </h2>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {isEdit
                  ? user?.email
                  : "Completa los datos para crear un usuario"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
            aria-label="Cerrar modal"
          >
            <X size={14} />
          </button>
        </div>

        <form
          onSubmit={formHandleSubmit}
          onReset={formHandleReset}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Datos del usuario */}
            <section className="flex flex-col gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <UserCheck size={11} />
                  Datos del usuario
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  {isEdit
                    ? "Actualiza la información básica del usuario."
                    : "Estos datos serán usados para iniciar sesión en el sistema."}
                </p>
              </div>

              {/* Nombre */}
              <FormField>
                <Label required>Nombre</Label>

                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                  />

                  <input
                    name="name"
                    value={formValues.name}
                    onChange={formHandleChange}
                    onBlur={formHandlerBlur}
                    placeholder="Ej: Juan Pérez"
                    className={cn(
                      "h-9 w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-[13px] text-inkblack placeholder:text-muted-foreground/30",
                      "transition-all focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20",
                      formTouched.name && formErrors.name
                        ? "border-red-300"
                        : "border-surface",
                    )}
                  />
                </div>

                {formTouched.name && formErrors.name && (
                  <p className="text-[10px] text-red-500">{formErrors.name}</p>
                )}
              </FormField>

              {/* Email */}
              <FormField>
                <Label required>Email</Label>

                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                  />

                  <input
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={formHandleChange}
                    onBlur={formHandlerBlur}
                    placeholder="Ej: juan@buenasador.com"
                    className={cn(
                      "h-9 w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-[13px] text-inkblack placeholder:text-muted-foreground/30",
                      "transition-all focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20",
                      formTouched.email && formErrors.email
                        ? "border-red-300"
                        : "border-surface",
                    )}
                  />
                </div>

                {formTouched.email && formErrors.email && (
                  <p className="text-[10px] text-red-500">{formErrors.email}</p>
                )}
              </FormField>

              {/* Contraseña — solo en creación */}
              {!isEdit && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField>
                    <Label required>Contraseña</Label>

                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formValues.password}
                        onChange={formHandleChange}
                        onBlur={formHandlerBlur}
                        placeholder="Mínimo 8 caracteres"
                        className={cn(
                          "h-9 w-full rounded-xl border bg-white py-2 pl-3 pr-10 text-[13px] text-inkblack placeholder:text-muted-foreground/30",
                          "transition-all focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20",
                          formTouched.password && formErrors.password
                            ? "border-red-300"
                            : "border-surface",
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={13} />
                        ) : (
                          <Eye size={13} />
                        )}
                      </button>
                    </div>

                    {formTouched.password && formErrors.password && (
                      <p className="text-[10px] text-red-500">
                        {formErrors.password}
                      </p>
                    )}
                  </FormField>

                  <FormField>
                    <Label required>Repetir contraseña</Label>

                    <div className="relative">
                      <input
                        name="repitPassword"
                        type={showPassword ? "text" : "password"}
                        value={formValues.repitPassword}
                        onChange={formHandleChange}
                        onBlur={formHandlerBlur}
                        placeholder="Confirma la contraseña"
                        className={cn(
                          "h-9 w-full rounded-xl border bg-white py-2 pl-3 pr-10 text-[13px] text-inkblack placeholder:text-muted-foreground/30",
                          "transition-all focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20",
                          formTouched.repitPassword && formErrors.repitPassword
                            ? "border-red-300"
                            : "border-surface",
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={13} />
                        ) : (
                          <Eye size={13} />
                        )}
                      </button>
                    </div>

                    {formTouched.repitPassword && formErrors.repitPassword && (
                      <p className="text-[10px] text-red-500">
                        {formErrors.repitPassword}
                      </p>
                    )}
                  </FormField>
                </div>
              )}
            </section>

            {/* Sucursales y roles — solo edición */}
            {isEdit && (
              <section className="mt-5 border-t border-surface pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Building2 size={11} />
                      Sucursales y roles
                    </p>

                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      Sucursales activas donde este usuario tiene acceso.
                    </p>
                  </div>

                  <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    {activeLocations.length} asignada
                    {activeLocations.length === 1 ? "" : "s"}
                  </span>
                </div>

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
              </section>
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
                      onClick={handleDeactivate}
                      isLoading={isDeactivating}
                      className={cn(
                        "mt-3 h-8 rounded-xl border text-[11px] font-medium transition-all",
                        confirmDeactivate
                          ? "border-red-300 bg-red-100 text-red-700 hover:bg-red-200"
                          : "border-red-200 bg-white text-red-600 hover:bg-red-100",
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
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-surface bg-white px-5 py-3">
            <Button
              type="button"
              onClick={onClose}
              className="h-9 rounded-xl border border-surface bg-white px-4 text-[12px] font-medium text-muted-foreground hover:bg-surface"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              isLoading={isSaving}
              disabled={isEdit ? !formDirty || isSaving : isSaving}
              className="h-9 rounded-xl px-4 text-[12px] font-medium"
            >
              {isEdit ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
