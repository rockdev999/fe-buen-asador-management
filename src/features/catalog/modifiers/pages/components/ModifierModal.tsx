// src/features/catalog/categories/components/CategoryModal.tsx
import { useFormik } from "formik";
import { useMemo } from "react";
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
import { AsyncDropdown } from "@/components/shared/Interactives/AsyncDropdown";
import { LocationSimple } from "@/features/locations/models/location.model";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { ModifierModalSkeleton } from "./ModifierModalSkeleton";
import { FormSwitch } from "@/components/shared/Basics/FormSwitch";

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

  const { data: locations, status: locationsStatus } = useGetLocationSimple();
  const { mutate: createModifier, status: createStatus } = useCreateModifier();
  const { mutate: updateModifier, status: updateStatus } = useUpdateModifier(
    modifier?.id ?? "",
  );
  const { mutate: deleteModifier, status: deleteStatus } = useDeleteModifier(
    modifier?.id ?? "",
  );

  const isSaving = createStatus === "pending" || updateStatus === "pending";

  const hasLocations = Boolean(locations?.length);

  const initValues: CreateModifierForm = useMemo(() => {
    if (isEdit && modifier) {
      return {
        id: modifier.id ?? "",
        name: modifier.name,
        extraPrice: modifier.extraPrice ?? 0,
        active: modifier.active ?? false,
        location: {
          id: modifier.location.id,
          name: modifier.location.name,
        },
      };
    }
    return ModifierFormConfig.initialValues;
  }, [isEdit, modifier]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleChange: formHandleChange,
    setFieldValue: formSetFieldValue,
    setFieldTouched: formSetFieldTouched,
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

  const handleDelete = () => {
    if (!modifier) return;
    deleteModifier(modifier.id!, { onSuccess });
  };

  const handleDropdownChange = async (
    field: "categoryId" | "locationId",
    id: string,
  ) => {
    await formSetFieldValue(field, id, true);
    await formSetFieldTouched(field, true, false);
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
              <Label required>Sucursal</Label>
              <AsyncDropdown<LocationSimple>
                fullWidth
                allowClear={false}
                placeholder="Seleccionar sucursal"
                emptyText="No hay sucursales disponibles"
                value={formValues.location.id}
                options={
                  locations?.map((location) => ({
                    id: location.id,
                    data: location,
                    searchText: location.name,
                    render: (item) => (
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-inkblack">
                          {item.name}
                        </span>
                      </div>
                    ),
                  })) ?? []
                }
                onChange={(data) => {
                  handleDropdownChange("location", {
                    id: data.id,
                    name: data.name,
                  });
                }}
                renderSelected={(location) => location.name}
              />
              {formErrors.location?.id && (
                <ErrorMessage
                  touched={formTouched.location?.id}
                  error={formErrors.location?.id}
                />
              )}
              {!hasLocations && (
                <EmptyFieldHint text="Primero crea una sucursal para poder registrar productos." />
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
                label="Precio"
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

            {/* Info global */}
            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <Tags size={13} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-4 text-blue-700">
                Este modificador estará disponible para todos los productos de
                todas las sucursales.
              </p>
            </div>
          </FormSection>
        </div>

        <PanelFooter>
          <Button
            type="button"
            isLoading={deleteStatus === "pending"}
            disabled={isSaving || !isEdit}
            onClick={handleDelete}
            variant="danger"
          >
            Eliminar
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
