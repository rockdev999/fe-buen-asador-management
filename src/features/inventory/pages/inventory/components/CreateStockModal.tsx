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
import { Button } from "@/components/shared/Basics/Button";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { LocationSimple } from "@/features/locations/models/location.model";
import { useProductsHandler } from "@/features/catalog/products/hooks/useProducts";
import { useAdjustStock, useStockHandler } from "../../../hooks/useInventory";
import { CreateStockFormConfig } from "../../../forms/inventory.form-config";
import { CreateStockForm } from "../../../validators/inventory.schema";

interface CreateStockModalProps {
  locations: LocationSimple[] | null;
  defaultLocationId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateStockModal = ({
  locations,
  defaultLocationId,
  onClose,
  onSuccess,
}: CreateStockModalProps) => {
  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandleBlur,
    setFieldValue,
    setFieldTouched,
    handleSubmit: formHandleSubmit,
    handleReset: formHandleReset,
  } = useFormik<CreateStockForm>({
    initialValues: {
      ...CreateStockFormConfig.initialValues,
      locationId: defaultLocationId ?? "",
    },
    validate: CreateStockFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = CreateStockFormConfig.mapFormToDTO(data);
      adjustStock(dto, { onSuccess });
    },
  });

  const { mutate: adjustStock, status: createStatus } = useAdjustStock(
    formValues.locationId,
  );

  const { data: products, status: productsStatus } = useProductsHandler();
  const { data: existingStock, status: existingStockStatus } = useStockHandler(
    formValues.locationId,
    !!formValues.locationId,
  );

  const hasLocations = Boolean(locations?.length);
  const existingProductIds = useMemo(
    () => new Set((existingStock ?? []).map((item) => item.product.id)),
    [existingStock],
  );

  const availableProducts = useMemo(
    () =>
      (products ?? []).filter(
        (product) =>
          product.isQuantifiable &&
          product.locations.some((loc) => loc.id === formValues.locationId) &&
          !existingProductIds.has(product.id),
      ),
    [products, formValues.locationId, existingProductIds],
  );

  const locationOptions: AsyncDropdownOption<LocationSimple>[] = (
    locations ?? []
  ).map((location) => ({
    id: location.id,
    data: location,
    searchText: location.name,
    render: (item) => <span className="text-[13px] text-inkblack">{item.name}</span>,
  }));

  const productOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    availableProducts.map((product) => ({
      id: product.id,
      data: product,
      searchText: product.name,
      render: (item) => <span className="text-[13px] text-inkblack">{item.name}</span>,
    }));

  const handleLocationChange = async (id: string) => {
    await setFieldValue("locationId", id, true);
    await setFieldTouched("locationId", true, false);
    await setFieldValue("productId", "", false);
  };

  const handleProductChange = async (id: string) => {
    await setFieldValue("productId", id, true);
    await setFieldTouched("productId", true, false);
  };

  const isLoadingProducts =
    productsStatus === "pending" ||
    (!!formValues.locationId && existingStockStatus === "pending");

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[85vh]" contentClassName="max-w-lg">
      <PanelHeader
        icon={PackagePlus}
        title="Nuevo stock"
        description="Registra el stock inicial de un producto en una sucursal."
        onClose={onClose}
      />

      <form
        onSubmit={formHandleSubmit}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FormSection icon={PackagePlus} title="Producto y sucursal">
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
              <Label required>Producto</Label>
              <AsyncDropdown<{ id: string; name: string }>
                fullWidth
                searchable
                allowClear={false}
                disabled={!formValues.locationId}
                placeholder={
                  formValues.locationId
                    ? "Seleccionar producto"
                    : "Selecciona primero una sucursal"
                }
                emptyText="No hay productos disponibles para registrar stock"
                isLoading={isLoadingProducts}
                value={formValues.productId}
                options={productOptions}
                onChange={(id) => handleProductChange(id)}
                renderSelected={(product) => product.name}
              />
              {formErrors.productId && (
                <ErrorMessage
                  touched={formTouched.productId}
                  error={formErrors.productId}
                />
              )}
              {formValues.locationId &&
                !isLoadingProducts &&
                availableProducts.length === 0 && (
                  <EmptyFieldHint text="Todos los productos cuantificables de esta sucursal ya tienen stock registrado." />
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
            />

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
                El producto quedará disponible en el inventario de la sucursal
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
            disabled={!formValues.locationId || !formValues.productId}
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
