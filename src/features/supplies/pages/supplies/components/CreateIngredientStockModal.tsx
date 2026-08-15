import { useFormik } from "formik";
import { useMemo } from "react";
import { Info, PackagePlus } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { FormSection } from "@/components/shared/Form/FormSection";
import { FormInput } from "@/components/shared/Form/FormInput";
import { FormTextarea } from "@/components/shared/Form/FormTextarea";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { Button } from "@/components/shared/Basics/Button";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { LocationSimple } from "@/features/locations/models/location.model";
import { useIngredientsSimpleHandler } from "../../../hooks/useIngredients";
import {
  useAdjustIngredientStock,
  useIngredientStockHandler,
} from "../../../hooks/useIngredientStock";
import { CreateIngredientStockFormConfig } from "../../../forms/ingredient-stock.form-config";
import { CreateIngredientStockForm } from "../../../validators/ingredient-stock.schema";
import { INGREDIENT_UNIT_LABELS } from "../../../config/ingredient.table";

interface CreateIngredientStockModalProps {
  locations: LocationSimple[] | null;
  defaultLocationId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIngredientStockModal = ({
  locations,
  defaultLocationId,
  onClose,
  onSuccess,
}: CreateIngredientStockModalProps) => {
  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandleBlur,
    setFieldValue,
    setFieldTouched,
    handleSubmit: formHandleSubmit,
    handleReset: formHandleReset,
  } = useFormik<CreateIngredientStockForm>({
    initialValues: {
      ...CreateIngredientStockFormConfig.initialValues,
      locationId: defaultLocationId ?? "",
    },
    validate: CreateIngredientStockFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = CreateIngredientStockFormConfig.mapFormToDTO(data);
      adjustStock(dto, { onSuccess });
    },
  });

  const { mutate: adjustStock, status: createStatus } =
    useAdjustIngredientStock(formValues.locationId);

  const { data: ingredients, status: ingredientsStatus } =
    useIngredientsSimpleHandler();
  const { data: existingStock, status: existingStockStatus } =
    useIngredientStockHandler(formValues.locationId, !!formValues.locationId);

  const hasLocations = Boolean(locations?.length);
  const existingIngredientIds = useMemo(
    () => new Set((existingStock ?? []).map((item) => item.ingredient.id)),
    [existingStock],
  );

  const availableIngredients = useMemo(
    () =>
      (ingredients ?? []).filter(
        (ingredient) => !existingIngredientIds.has(ingredient.id),
      ),
    [ingredients, existingIngredientIds],
  );

  const selectedIngredient = availableIngredients.find(
    (ingredient) => ingredient.id === formValues.ingredientId,
  );

  const locationOptions: AsyncDropdownOption<LocationSimple>[] = (
    locations ?? []
  ).map((location) => ({
    id: location.id,
    data: location,
    searchText: location.name,
    render: (item) => <span className="text-[13px] text-inkblack">{item.name}</span>,
  }));

  const ingredientOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    availableIngredients.map((ingredient) => ({
      id: ingredient.id,
      data: ingredient,
      searchText: ingredient.name,
      render: (item) => <span className="text-[13px] text-inkblack">{item.name}</span>,
    }));

  const handleLocationChange = async (id: string) => {
    await setFieldValue("locationId", id, true);
    await setFieldTouched("locationId", true, false);
    await setFieldValue("ingredientId", "", false);
  };

  const handleIngredientChange = async (id: string) => {
    await setFieldValue("ingredientId", id, true);
    await setFieldTouched("ingredientId", true, false);
  };

  const isLoadingIngredients =
    ingredientsStatus === "pending" ||
    (!!formValues.locationId && existingStockStatus === "pending");

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[85vh]" contentClassName="max-w-lg">
      <PanelHeader
        icon={PackagePlus}
        title="Nuevo stock de insumo"
        description="Registra el stock inicial de un insumo en una sucursal."
        onClose={onClose}
      />

      <form
        onSubmit={formHandleSubmit}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FormSection icon={PackagePlus} title="Insumo y sucursal">
            <FormField>
              <Label required>Sucursal</Label>
              <AsyncDropdown<LocationSimple>
                fullWidth
                allowClear={false}
                placeholder="Seleccionar sucursal"
                emptyText="No hay sucursales disponibles"
                value={formValues.locationId}
                options={locationOptions}
                onChange={(id) => handleLocationChange(id)}
                renderSelected={(location) => location.name}
              />
              {formErrors.locationId && (
                <ErrorMessage
                  touched={formTouched.locationId}
                  error={formErrors.locationId}
                />
              )}
              {!hasLocations && (
                <EmptyFieldHint text="Primero crea una sucursal para poder registrar stock." />
              )}
            </FormField>

            <FormField>
              <Label required>Insumo</Label>
              <AsyncDropdown<{ id: string; name: string }>
                fullWidth
                searchable
                allowClear={false}
                disabled={!formValues.locationId}
                placeholder={
                  formValues.locationId
                    ? "Seleccionar insumo"
                    : "Selecciona primero una sucursal"
                }
                emptyText="No hay insumos disponibles para registrar stock"
                isLoading={isLoadingIngredients}
                value={formValues.ingredientId}
                options={ingredientOptions}
                onChange={(id) => handleIngredientChange(id)}
                renderSelected={(ingredient) => ingredient.name}
              />
              {formErrors.ingredientId && (
                <ErrorMessage
                  touched={formTouched.ingredientId}
                  error={formErrors.ingredientId}
                />
              )}
              {formValues.locationId &&
                !isLoadingIngredients &&
                availableIngredients.length === 0 && (
                  <EmptyFieldHint text="Todos los insumos ya tienen stock registrado en esta sucursal." />
                )}
            </FormField>

            <FormInput
              required
              id="quantity"
              name="quantity"
              label="Cantidad inicial"
              type="number"
              min={0}
              placeholder="Ej: 50"
              value={formValues.quantity}
              onChange={(event) => {
                const value = event.target.value;
                setFieldValue("quantity", value === "" ? 0 : Number(value));
              }}
              onBlur={formHandleBlur}
              touched={formTouched.quantity}
              error={formErrors.quantity}
              className="h-9 rounded-xl bg-white text-[13px]"
              helperText={
                selectedIngredient
                  ? `Unidad: ${INGREDIENT_UNIT_LABELS[selectedIngredient.unitOfMeasure]}`
                  : undefined
              }
            />

            <FormField>
              <Label>Costo unitario</Label>
              <MoneyInput
                id="unitCost"
                name="unitCost"
                defaultValue={formValues.unitCost}
                onChange={(value) => setFieldValue("unitCost", value || undefined)}
                onBlur={() => {}}
                placeholder="0.00"
                className="h-9 rounded-xl bg-white text-[13px]"
              />
              {formErrors.unitCost && (
                <ErrorMessage
                  touched={formTouched.unitCost}
                  error={formErrors.unitCost}
                />
              )}
            </FormField>

            <FormTextarea
              id="notes"
              name="notes"
              label="Notas"
              placeholder="Ej: Stock inicial de apertura"
              value={formValues.notes ?? ""}
              onChange={(event) => setFieldValue("notes", event.target.value)}
              onBlur={formHandleBlur}
              touched={formTouched.notes}
              error={formErrors.notes}
              rows={3}
              helperText="Opcional. Máximo 500 caracteres."
              className="rounded-xl bg-white text-[13px]"
            />

            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <Info size={13} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-4 text-blue-700">
                El insumo quedará disponible en el inventario de la sucursal
                seleccionada con la cantidad indicada.
              </p>
            </div>
          </FormSection>
        </div>

        <PanelFooter align="right">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createStatus === "pending"}
            disabled={!formValues.locationId || !formValues.ingredientId}
          >
            Registrar stock
          </Button>
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
      <Info size={12} className="mt-0.5 shrink-0 text-yellow-600" />
      <p className="text-[10px] leading-4 text-yellow-700">{text}</p>
    </div>
  );
}
