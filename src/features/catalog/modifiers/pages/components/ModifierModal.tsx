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
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { ModifierModalSkeleton } from "./ModifierModalSkeleton";
import { FormSwitch } from "@/components/shared/Basics/FormSwitch";
import { ApiErrorResponse } from "@/types/api.types";
import { ConfirmDeactivateModal } from "@/components/shared/Overlay/ConfirmDeactivateModal";
import { getFieldError } from "@/lib/zodToFormik";
import {
  LocationPriceList,
  LocationPriceValue,
} from "@/components/shared/Interactives/LocationPriceList";

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

  // Sucursales y precios se editan juntos en LocationPriceList, que trabaja
  // con { locationId, price }; aquí el campo se llama extraPrice. El 0
  // ("gratis") es un precio propio válido; null = usa el general.
  const listPrices: LocationPriceValue[] = (formValues.locationPrices ?? []).map(
    (lp) => ({ locationId: lp.locationId, price: lp.extraPrice }),
  );

  const handleLocationPricesChange = (
    ids: string[],
    prices: LocationPriceValue[],
  ) => {
    formSetFieldValue("locationIds", ids, true);
    formSetFieldValue(
      "locationPrices",
      prices.map((p) => ({ locationId: p.locationId, extraPrice: p.price })),
      true,
    );
    formSetFieldTouched("locationIds", true, false);
  };

  const getLocationPriceError = (locationId: string) => {
    const index = (formValues.locationPrices ?? []).findIndex(
      (lp) => lp.locationId === locationId,
    );
    return getFieldError(formErrors, `locationPrices.${index}.extraPrice`);
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

              <FormSwitch
                label="Modificador activo"
                description="Si el modificador está inactivo, no se podrá agregar a los productos."
                checked={formValues.active ?? false}
                onChange={(checked) => formSetFieldValue("active", checked)}
              />
            </div>

            <FormField>
              <Label required>Sucursales y precios</Label>
              <p className="-mt-0.5 mb-1 text-[11px] text-muted-foreground">
                Marca dónde se ofrece y cambia el monto si esa sucursal cobra
                distinto (0 = gratis). Si queda igual al general, seguirá al
                general.
              </p>
              {hasLocations ? (
                <LocationPriceList
                  allowZero
                  locations={locations ?? []}
                  selectedIds={formValues.locationIds ?? []}
                  prices={listPrices}
                  basePrice={formValues.extraPrice}
                  onChange={handleLocationPricesChange}
                  getPriceError={getLocationPriceError}
                  error={
                    formTouched.locationIds
                      ? (formErrors.locationIds as string | undefined)
                      : undefined
                  }
                />
              ) : (
                <EmptyFieldHint text="Primero crea una sucursal para poder registrar modificadores." />
              )}
            </FormField>
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
