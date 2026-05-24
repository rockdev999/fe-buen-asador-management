// src/features/catalog/categories/components/CategoryModal.tsx
import { useFormik } from "formik";
import { useMemo } from "react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { FormSection } from "@/components/shared/Form/FormSection";
import { FormInput } from "@/components/shared/Form/FormInput";
import { Button } from "@/components/shared/Basics/Button";
import { Tags, ListOrdered } from "lucide-react";
import { Category } from "../../models/category.model";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useCategories";
import { CategoryFormConfig } from "../../forms/category.form-config";
import { CreateCategoryForm } from "../../validators/category.schema";

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryModal = ({
  category,
  onClose,
  onSuccess,
}: CategoryModalProps) => {
  const isEdit = !!category;

  const { mutate: createCategory, status: createStatus } = useCreateCategory();
  const { mutate: updateCategory, status: updateStatus } = useUpdateCategory(
    category?.id ?? "",
  );
  const { mutate: deleteCategory, status: deleteStatus } = useDeleteCategory(
    category?.id ?? "",
  );

  const isSaving = createStatus === "pending" || updateStatus === "pending";

  const initValues: CreateCategoryForm = useMemo(() => {
    if (isEdit && category) {
      return {
        id: category.id ?? "",
        name: category.name,
        sortOrder: category.sortOrder ?? "",
      };
    }
    return CategoryFormConfig.initialValues;
  }, [isEdit, category]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleChange: formHandleChange,
    setFieldValue: formSetFieldValue,
    handleBlur: formHandleBlur,
    handleSubmit: formSubmitHandler,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<CreateCategoryForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: CategoryFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = CategoryFormConfig.mapFormToDTO(data);
      if (isEdit) {
        updateCategory(dto, { onSuccess });
      } else {
        createCategory(dto, { onSuccess });
      }
    },
  });

  const handleDelete = () => {
    if (!category) return;
    deleteCategory(category.id!, { onSuccess });
  };

  return (
    <AppModal size="sm" maxHeightClassName="max-h-[80vh]">
      <PanelHeader
        icon={Tags}
        title={isEdit ? "Editar categoría" : "Nueva categoría"}
        onClose={onClose}
      />

      <form
        onSubmit={formSubmitHandler}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FormSection icon={Tags} title="Datos de la categoría">
            <FormInput
              required
              id="name"
              name="name"
              label="Nombre"
              placeholder="Ej: Parrillas, Bebidas, Postres"
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
                    Orden visual
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Define la posición de la categoría en el menú. Menor número
                    = aparece primero.
                  </p>
                </div>
              </div>

              <FormInput
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
              />
            </div>

            {/* Info global */}
            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <Tags size={13} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-4 text-blue-700">
                Esta categoría estará disponible para todos los productos de
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
