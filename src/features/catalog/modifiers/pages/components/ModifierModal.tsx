// src/features/catalog/categories/components/CategoryModal.tsx
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { FormSection } from "@/components/shared/Form/FormSection";
import { FormInput } from "@/components/shared/Form/FormInput";
import { Button } from "@/components/shared/Basics/Button";
import { Tags, ListOrdered, AlertCircle } from "lucide-react";
import { Modifier } from "../../models/modifier.model";
import {
  useCreateModifier,
  useDeleteModifier,
  useUpdateModifier,
} from "../../hooks/useModifiers";
import { CreateModifierForm } from "../../validators/modifier.schema";
import { ModifierFormConfig } from "../../forms/modifier.form-config";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { MultiSelectDropdown } from "@/components/shared/Interactives/MultiSelectDropdown";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { ModifierModalSkeleton } from "./ModifierModalSkeleton";
import { FormSwitch } from "@/components/shared/Basics/FormSwitch";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { ApiErrorResponse } from "@/types/api.types";
import { ConfirmDeactivateModal } from "@/components/shared/Overlay/ConfirmDeactivateModal";
import { Switch } from "@/components/shared/Basics/Switch";
import { formatMoney } from "@/lib/utils";
import { getFieldError } from "@/lib/zodToFormik";

interface ModifierModalProps {
  modifier: Modifier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModifierModal = ({
  modifier,
  onClose,
  onSuccess,
}: ModifierModalProps) => {
  const isEdit = !!modifier;

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const { data: locations, status: locationsStatus } = useGetLocationSimple();

  const handleForbiddenLocation = (error: ApiErrorResponse) => {
    if (error.errorCode === "FORBIDDEN") {
      formSetFieldError("locationIds", error.message);
    }
  };

  const { mutate: createModifier, status: createStatus } = useCreateModifier({
    onErrorCallback: handleForbiddenLocation,
  });
  const { mutate: updateModifier, status: updateStatus } = useUpdateModifier(
    modifier?.id ?? "",
    { onErrorCallback: handleForbiddenLocation },
  );
  const { mutate: deleteModifier, status: deleteStatus } = useDeleteModifier(
    modifier?.id ?? "",
  );

  const isSaving = createStatus === "pending" || updateStatus === "pending";

  const hasLocations = Boolean(locations?.length);

  // Solo el MANAGER crea y edita modificadores (el ADMIN los ve en lectura).
  const initValues: CreateModifierForm = useMemo(() => {
    if (isEdit && modifier) {
      return {
        id: modifier.id ?? "",
        name: modifier.name,
        // baseExtraPrice y no extraPrice: este puede venir resuelto para una sucursal.
        extraPrice: modifier.baseExtraPrice ?? 0,
        active: modifier.active ?? false,
        locationIds: modifier.locations.map((location) => location.id),
        locationPrices: modifier.locations.map((location) => ({
          locationId: location.id,
          extraPrice: location.extraPrice,
        })),
      };
    }
    return {
      ...ModifierFormConfig.initialValues,
      locationIds: [],
      locationPrices: [],
    };
  }, [isEdit, modifier]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleChange: formHandleChange,
    setFieldValue: formSetFieldValue,
    setFieldTouched: formSetFieldTouched,
    setFieldError: formSetFieldError,
    handleBlur: formHandleBlur,
    handleSubmit: formSubmitHandler,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<CreateModifierForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: ModifierFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = ModifierFormConfig.mapFormToDTO(data);
      if (isEdit) {
        updateModifier(dto, { onSuccess });
      } else {
        createModifier(dto, { onSuccess });
      }
    },
  });

  // Una fila por sucursal elegida: al quitar una sucursal se quita su fila; las
  // que siguen elegidas conservan su precio.
  const handleLocationsChange = (ids: string[]) => {
    const current = formValues.locationPrices ?? [];
    formSetFieldValue("locationIds", ids, true);
    formSetFieldValue(
      "locationPrices",
      ids.map(
        (locationId) =>
          current.find((lp) => lp.locationId === locationId) ?? {
            locationId,
            extraPrice: null,
          },
      ),
      true,
    );
    formSetFieldTouched("locationIds", true, false);
  };

  // El 0 ("gratis") no es lo mismo que vacío ("usa el general"): el check
  // "Precio propio" decide. Al marcarlo se parte del precio general.
  const setLocationExtraPrice = (
    locationId: string,
    extraPrice: number | null,
  ) => {
    formSetFieldValue(
      "locationPrices",
      (formValues.locationPrices ?? []).map((lp) =>
        lp.locationId === locationId ? { ...lp, extraPrice } : lp,
      ),
      true,
    );
  };

  const handleDelete = () => {
    if (!modifier) return;
    deleteModifier(modifier.id!, { onSuccess });
  };

  if (locationsStatus === "pending") {
    return (
      <AppModal size="sm" maxHeightClassName="max-h-[80vh]">
        <ModifierModalSkeleton />
      </AppModal>
    );
  }

  return (
    <AppModal size="sm" maxHeightClassName="max-h-[80vh]">
      <PanelHeader
        icon={Tags}
        title={isEdit ? "Editar modificador" : "Nuevo modificador"}
        onClose={onClose}
      />

      <form
        onSubmit={formSubmitHandler}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FormSection icon={Tags} title="Datos del modificador">
            <FormInput
              required
              id="name"
              name="name"
              label="Nombre"
              placeholder="Ej: Carne extra"
              value={formValues.name}
              onChange={formHandleChange}
              onBlur={formHandleBlur}
              touched={formTouched.name}
              error={formErrors.name}
              className="h-9 rounded-xl bg-white text-[13px]"
            />

            <FormField>
              <Label required>Sucursales</Label>
              <MultiSelectDropdown
                options={
                  locations?.map((location) => ({
                    value: location.id,
                    label: location.name,
                  })) ?? []
                }
                value={formValues.locationIds ?? []}
                onChange={handleLocationsChange}
                placeholder="Seleccionar sucursales..."
                emptyText="No hay sucursales disponibles"
                error={formErrors.locationIds as string}
                touched={formTouched.locationIds as boolean}
              />
              {!hasLocations && (
                <EmptyFieldHint text="Primero crea una sucursal para poder registrar productos." />
              )}
              {formErrors.locationIds && (
                <ErrorMessage
                  touched={!!formTouched.locationIds}
                  error={formErrors.locationIds as string}
                />
              )}
            </FormField>

            <div className="rounded-2xl border border-surface bg-surface/20 p-3">
              <div className="mb-2 flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                  <ListOrdered size={14} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-inkblack">
                    Monto extra del modificador
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Define el monto adicional que se agregará al precio del
                    producto cuando se seleccione este modificador.
                  </p>
                </div>
              </div>

              {/* <FormInput
                required
                id="sortOrder"
                name="sortOrder"
                label="Orden"
                type="string"
                min={0}
                placeholder="Ej: 1"
                value={formValues.sortOrder}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    formSetFieldValue("sortOrder", "");
                    return;
                  }
                  if (!/^\d+$/.test(value)) return;

                  formSetFieldValue("sortOrder", value);
                }}
                onBlur={formHandleBlur}
                touched={formTouched.sortOrder}
                error={formErrors.sortOrder}
                helperText="Mientras menor sea el número, más arriba aparecerá."
                className="h-9 rounded-xl bg-white text-[13px]"
              /> */}
              <MoneyInput
                required
                id="extraPrice"
                name="extraPrice"
                label="Precio extra general"
                placeholder="Ej: 100.00"
                defaultValue={formValues.extraPrice}
                onChange={(value) => formSetFieldValue("extraPrice", value)}
                onBlur={formHandleBlur}
                // touched={formTouched.extraPrice}
                error={formErrors.extraPrice}
                className="h-9 rounded-xl bg-white text-[13px]"
              />

              {(formValues.locationPrices?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-col gap-2 border-t border-surface pt-3">
                  <div>
                    <p className="text-[12px] font-semibold text-inkblack">
                      Precio por sucursal
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Activa &quot;Precio propio&quot; para cobrar otro monto en
                      esa sucursal (0 = gratis). Desactivado usa el precio
                      general.
                    </p>
                  </div>
                  {formValues.locationPrices!.map((lp, index) => {
                    const name =
                      locations?.find((loc) => loc.id === lp.locationId)
                        ?.name ?? "sucursal";
                    const hasOwn = lp.extraPrice !== null;
                    const generalText = `Precio general: ${formatMoney(formValues.extraPrice || 0)}`;
                    const rowError = getFieldError(
                      formErrors,
                      `locationPrices.${index}.extraPrice`,
                    );
                    return (
                      <div key={lp.locationId} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] text-inkblack">
                            Precio en {name}
                          </span>
                          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            Precio propio
                            <Switch
                              checked={hasOwn}
                              onChange={(checked) =>
                                setLocationExtraPrice(
                                  lp.locationId,
                                  checked ? (formValues.extraPrice ?? 0) : null,
                                )
                              }
                              ariaLabel={`Precio propio en ${name}`}
                            />
                          </label>
                        </div>
                        <MoneyInput
                          id={`locationPrice-${lp.locationId}`}
                          disabled={!hasOwn}
                          defaultValue={lp.extraPrice ?? 0}
                          onChange={(value) =>
                            setLocationExtraPrice(lp.locationId, value)
                          }
                          placeholder={
                            hasOwn ? "Gratis (Bs. 0.00)" : generalText
                          }
                          error={rowError}
                          className="h-9 rounded-xl bg-white text-[13px] disabled:opacity-60"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <FormSwitch
                label="Modificador activo"
                description="Si el modificador está inactivo, no se podrá agregar a los productos."
                checked={formValues.active ?? false}
                onChange={(checked) => formSetFieldValue("active", checked)}
              />
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <Tags size={13} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-4 text-blue-700">
                Este modificador estará disponible para los productos de las
                sucursales seleccionadas.
              </p>
            </div>
          </FormSection>
        </div>

        <PanelFooter>
          <Button
            type="button"
            disabled={isSaving || !isEdit}
            onClick={() => setConfirmDeactivate(true)}
            variant="danger"
          >
            Dar de baja
          </Button>
          <div>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSaving}
              disabled={isEdit ? !formDirty || isSaving : isSaving}
              onClick={() => console.log(formErrors)}
            >
              {isEdit ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </PanelFooter>
      </form>

      {confirmDeactivate && modifier && (
        <ConfirmDeactivateModal
          title="Dar de baja modificador"
          itemName={modifier.name}
          isPending={deleteStatus === "pending"}
          onClose={() => setConfirmDeactivate(false)}
          onConfirm={handleDelete}
        />
      )}
    </AppModal>
  );
};

interface EmptyFieldHintProps {
  text: string;
}

function EmptyFieldHint({ text }: EmptyFieldHintProps) {
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-yellow-50 px-2 py-1.5">
      <AlertCircle size={12} className="mt-0.5 shrink-0 text-yellow-600" />
      <p className="text-[10px] leading-4 text-yellow-700">{text}</p>
    </div>
  );
}
