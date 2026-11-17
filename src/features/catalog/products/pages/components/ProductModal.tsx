import { useFormik } from "formik";
import { CreateProductForm } from "../../validators/product.schema";
import { useMemo, useState } from "react";
import {
  useCreateProduct,
  useDeleteProduct,
  useGetProductById,
  useUpdateProduct,
} from "../../hooks/useProducts";
import { UUID } from "@/types/common";
import { ProductFormConfig } from "../../forms/product.form-config";
import { FormSection } from "@/components/shared/Form/FormSection";
import { FormInput } from "@/components/shared/Form/FormInput";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { FormTextarea } from "@/components/shared/Form/FormTextarea";
import { Button } from "@/components/shared/Basics/Button";
import { CategoryShort } from "@/features/catalog/categories/models/category.model";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import {
  AlertCircle,
  ImageIcon,
  ListOrdered,
  Package,
  Settings2,
  Tags,
} from "lucide-react";
import { FormSwitch } from "@/components/shared/Basics/FormSwitch";
import { LocationSimple } from "@/features/locations/models/location.model";
import { ImageUploader } from "@/components/shared/Interactives/ImageUploader";
import { AsyncDropdown } from "@/components/shared/Interactives/AsyncDropdown";
import { MultiSelectDropdown } from "@/components/shared/Interactives/MultiSelectDropdown";
import { ProductModalSkeleton } from "./ProductModalSkeleton";
import { ApiErrorResponse } from "@/types/api.types";
import { ConfirmDeactivateModal } from "@/components/shared/Overlay/ConfirmDeactivateModal";
import { formatMoney } from "@/lib/utils";
import { Switch } from "@/components/shared/Basics/Switch";
import { getFieldError } from "@/lib/zodToFormik";

interface ProductModalProps {
  productId?: UUID | null;
  categories: CategoryShort[] | null;
  locations: LocationSimple[] | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductModal = ({
  productId,
  categories,
  locations,
  onClose,
  onSuccess,
}: ProductModalProps) => {
  const isEdit = !!productId;

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const { data: product, status: productStatus } = useGetProductById(
    productId ?? "",
  );

  const handleForbiddenLocation = (error: ApiErrorResponse) => {
    if (error.errorCode === "FORBIDDEN") {
      setFieldError("locationIds", error.message);
    }
  };

  const { mutate: createProduct, status: createStatus } = useCreateProduct({
    onErrorCallback: handleForbiddenLocation,
  });
  const { mutate: updateProduct, status: updateStatus } = useUpdateProduct(
    productId ?? "",
    { onErrorCallback: handleForbiddenLocation },
  );
  const { mutate: deleteProduct, status: deleteStatus } = useDeleteProduct(
    productId ?? "",
  );

  const hasCategories = Boolean(categories?.length);
  const hasLocations = Boolean(locations?.length);
  const hasImageChanges = imageFile !== null || removeImage;

  // Solo el MANAGER crea y edita productos (el ADMIN solo cambia disponibilidad).
  const initValues: CreateProductForm = useMemo(() => {
    if (isEdit && product) {
      return {
        id: product.id,
        name: product.name,
        brand: product.brand ?? "",
        description: product.description ?? "",
        imageUrl: product.imageUrl ?? "",
        // basePrice y no price: price puede venir resuelto para una sucursal.
        price: product.basePrice,
        available: product.available,
        isQuantifiable: product.isQuantifiable,
        haveModifiers: product.haveModifiers,
        categoryId: product.category.id ?? "",
        locationIds: product.locations.map((location) => location.id),
        locationPrices: product.locations.map((location) => ({
          locationId: location.id,
          price: location.price,
        })),
        sortOrder: product.sortOrder ?? 0,
      };
    }
    return {
      ...ProductFormConfig.initialValues,
      locationIds: [],
      locationPrices: [],
    };
  }, [isEdit, product]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandlerBlur,
    handleChange: formHandleChange,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    handleSubmit: formHandleSubmit,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<CreateProductForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: ProductFormConfig.validationSchemaCreate,
    onSubmit: (data: CreateProductForm) => {
      const formData = ProductFormConfig.mapFormToFormData(
        data,
        imageFile,
        removeImage,
      );
      if (isEdit) {
        updateProduct(formData, { onSuccess: onSuccess });
      } else {
        createProduct(formData, { onSuccess: onSuccess });
      }
    },
  });

  // Una fila de precio por sucursal elegida: al quitar una sucursal se quita
  // su fila; las que siguen elegidas conservan lo que ya se escribió.
  const handleLocationsChange = (ids: string[]) => {
    const current = formValues.locationPrices ?? [];
    setFieldValue("locationIds", ids, true);
    setFieldValue(
      "locationPrices",
      ids.map(
        (locationId) =>
          current.find((lp) => lp.locationId === locationId) ?? {
            locationId,
            price: null,
          },
      ),
      true,
    );
    setFieldTouched("locationIds", true, false);
  };

  // Igual que en modificadores: el switch "Precio propio" decide si la
  // sucursal usa el general (null) o su propio precio. Al activarlo se parte
  // del precio general para no dejar un valor vacío por accidente.
  const setLocationPrice = (locationId: string, price: number | null) => {
    setFieldValue(
      "locationPrices",
      (formValues.locationPrices ?? []).map((lp) =>
        lp.locationId === locationId ? { ...lp, price } : lp,
      ),
      true,
    );
  };

  const handleDropdownChange = async (field: "categoryId", id: string) => {
    await setFieldValue(field, id, true);
    await setFieldTouched(field, true, false);
  };

  if (isEdit && productStatus === "pending") {
    return (
      <AppModal
        size="lg"
        maxHeightClassName="max-h-[85vh]"
        contentClassName="max-w-lg"
      >
        <ProductModalSkeleton />
      </AppModal>
    );
  }

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[90vh]">
      <PanelHeader
        icon={Package}
        title={isEdit ? "Editar producto" : "Nuevo producto"}
        description={
          isEdit
            ? "Actualiza los datos del producto y su configuración de venta."
            : "Completa los datos principales para registrar un producto en el catálogo."
        }
        onClose={onClose}
      />

      <form
        onSubmit={formHandleSubmit}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Datos principales */}
          <FormSection icon={Package} title="Datos del producto">
            <FormInput
              required
              id="name"
              name="name"
              label="Nombre"
              placeholder="Ej: Churrasco especial"
              value={formValues.name}
              onChange={formHandleChange}
              onBlur={formHandlerBlur}
              touched={formTouched.name}
              error={formErrors.name}
              className="h-9 rounded-xl bg-white text-[13px]"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput
                id="brand"
                name="brand"
                label="Marca"
                placeholder="Ej: Coca Cola"
                value={formValues.brand ?? ""}
                onChange={formHandleChange}
                onBlur={formHandlerBlur}
                touched={formTouched.brand}
                error={formErrors.brand}
                className="h-9 rounded-xl bg-white text-[13px]"
              />

              <FormField>
                <Label required>Precio general</Label>
                <MoneyInput
                  id="price"
                  name="price"
                  defaultValue={formValues.price}
                  onChange={(value) => setFieldValue("price", value)}
                  onBlur={() => setFieldTouched("price", true)}
                  placeholder="0.00"
                  className="h-9 rounded-xl bg-white text-[13px]"
                />
                {formErrors.price && (
                  <ErrorMessage
                    touched={formTouched.price}
                    error={formErrors.price}
                  />
                )}
              </FormField>
            </div>

            <FormTextarea
              id="description"
              name="description"
              label="Descripción"
              placeholder="Ej: Corte de carne acompañado de arroz, papa y ensalada."
              value={formValues.description ?? ""}
              onChange={formHandleChange}
              onBlur={formHandlerBlur}
              touched={formTouched.description}
              error={formErrors.description}
              rows={3}
              helperText="Opcional. Puedes usarlo para mostrar detalles del producto."
              className="rounded-xl bg-white text-[13px]"
            />
          </FormSection>

          {/* Clasificación */}
          <FormSection
            icon={Tags}
            title="Clasificación"
            description="Asocia el producto a una categoría y sucursal."
            className="mt-2 border-t border-surface pt-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField>
                <Label required>Categoría</Label>
                <AsyncDropdown<CategoryShort>
                  fullWidth
                  allowClear={false}
                  placeholder="Seleccionar categoría"
                  emptyText="No hay categorías disponibles"
                  value={formValues.categoryId}
                  options={
                    categories?.map((category) => ({
                      id: category.id,
                      data: category,
                      searchText: category.name,
                      render: (item) => (
                        <span className="text-[13px] text-inkblack">
                          {item.name}
                        </span>
                      ),
                    })) ?? []
                  }
                  onChange={(id) => {
                    handleDropdownChange("categoryId", id);
                  }}
                  renderSelected={(category) => category.name}
                />
                {formErrors.categoryId && (
                  <ErrorMessage
                    touched={formTouched.categoryId}
                    error={formErrors.categoryId}
                  />
                )}
                {!hasCategories && (
                  <EmptyFieldHint text="Primero crea una categoría para poder registrar productos." />
                )}
              </FormField>

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
            </div>

            {(formValues.locationPrices?.length ?? 0) > 0 && (
              <div className="mt-3 rounded-2xl border border-surface bg-surface/20 p-3">
                <p className="text-[12px] font-semibold text-inkblack">
                  Precio por sucursal
                </p>
                <p className="mt-0.5 mb-2 text-[11px] text-muted-foreground">
                  Activa &quot;Precio propio&quot; para cobrar otro monto en esa
                  sucursal. Desactivado usa el precio general.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {formValues.locationPrices!.map((lp, index) => {
                    const name =
                      locations?.find((loc) => loc.id === lp.locationId)
                        ?.name ?? "sucursal";
                    const hasOwn = lp.price !== null;
                    const rowError = getFieldError(
                      formErrors,
                      `locationPrices.${index}.price`,
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
                                setLocationPrice(
                                  lp.locationId,
                                  checked ? (formValues.price ?? 0) : null,
                                )
                              }
                              ariaLabel={`Precio propio en ${name}`}
                            />
                          </label>
                        </div>
                        <MoneyInput
                          id={`locationPrice-${lp.locationId}`}
                          disabled={!hasOwn}
                          defaultValue={lp.price ?? 0}
                          onChange={(value) =>
                            setLocationPrice(lp.locationId, value)
                          }
                          placeholder={
                            hasOwn
                              ? "Ej: 25.00"
                              : `Precio general: ${formatMoney(formValues.price || 0)}`
                          }
                          error={rowError}
                          className="h-9 rounded-xl bg-white text-[13px] disabled:opacity-60"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </FormSection>

          {/* Imagen y orden */}
          <FormSection
            icon={ImageIcon}
            title="Imagen y orden"
            description="Agrega una imagen para identificar el producto y define su posición en la categoría."
            className="mt-3 border-t border-surface pt-3"
          >
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <ImageUploader
                value={formValues.imageUrl ?? null}
                onChange={(file) => {
                  setImageFile(file);
                  setRemoveImage(false);
                }}
                onRemove={() => {
                  setImageFile(null);
                  setRemoveImage(true);
                  setFieldValue("imageUrl", "");
                }}
                maxSizeMB={5}
                label="Imagen del producto"
                hint="Recomendado: 800×800px, formato cuadrado y fondo limpio."
              />

              <div className="rounded-2xl border border-surface bg-surface/20 p-2">
                <div className="mb-3 flex items-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                    <ListOrdered size={14} />
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-inkblack">
                      Orden visual
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Define la posición del producto dentro de su categoría.
                    </p>
                  </div>
                </div>

                <FormInput
                  required
                  id="sortOrder"
                  name="sortOrder"
                  label="Orden"
                  type="number"
                  min={0}
                  placeholder="Ej: 1"
                  value={formValues.sortOrder}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFieldValue(
                      "sortOrder",
                      value === "" ? 0 : Number(value),
                    );
                  }}
                  onBlur={formHandlerBlur}
                  touched={formTouched.sortOrder}
                  error={formErrors.sortOrder}
                  helperText="Mientras menor sea el número, más arriba aparecerá."
                  className="h-9 rounded-xl bg-white text-[13px]"
                />
              </div>
            </div>
          </FormSection>

          {/* Configuración */}
          <FormSection
            icon={Settings2}
            title="Configuración de venta"
            description="Define cómo se comportará este producto dentro del POS."
            className="mt-2 border-t border-surface pt-4"
          >
            <div className="grid gap-3">
              <FormSwitch
                label="Disponible para venta"
                description="Si está desactivado, el producto no se mostrará como vendible."
                checked={formValues.available}
                onChange={(checked) => setFieldValue("available", checked)}
              />

              <FormSwitch
                label="Controlar stock"
                description="Actívalo si este producto debe manejar existencias en inventario."
                checked={formValues.isQuantifiable}
                onChange={(checked) => setFieldValue("isQuantifiable", checked)}
              />

              <FormSwitch
                label="Permite modificadores"
                description="Actívalo si el producto puede tener extras, agregados o variantes."
                checked={formValues.haveModifiers}
                onChange={(checked) => setFieldValue("haveModifiers", checked)}
              />
            </div>
          </FormSection>
        </div>

        <PanelFooter>
          <Button
            type="button"
            onClick={() => setConfirmDeactivate(true)}
            disabled={!isEdit}
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
              isLoading={
                createStatus === "pending" || updateStatus === "pending"
              }
              disabled={isEdit && !formDirty && !hasImageChanges}
            >
              {isEdit ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </PanelFooter>
      </form>

      {confirmDeactivate && product && (
        <ConfirmDeactivateModal
          title="Dar de baja producto"
          itemName={product.name}
          isPending={deleteStatus === "pending"}
          onClose={() => setConfirmDeactivate(false)}
          onConfirm={() => deleteProduct(product.id, { onSuccess })}
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
