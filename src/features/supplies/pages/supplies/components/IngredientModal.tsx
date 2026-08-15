import { useFormik } from "formik";
import { useMemo } from "react";
import { Wheat } from "lucide-react";
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
import { AsyncDropdown } from "@/components/shared/Interactives/AsyncDropdown";
import { IngredientUnitEnum } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Ingredient } from "../../../models/ingredient.model";
import {
  useCreateIngredient,
  useDeleteIngredient,
  useUpdateIngredient,
} from "../../../hooks/useIngredients";
import { IngredientFormConfig } from "../../../forms/ingredient.form-config";
import { CreateIngredientForm } from "../../../validators/ingredient.schema";
import { INGREDIENT_UNIT_LABELS } from "../../../config/ingredient.table";

interface IngredientModalProps {
  ingredient: Ingredient | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UNIT_OPTIONS = Object.values(IngredientUnitEnum).map((unit) => ({
  id: unit,
  data: unit,
  searchText: INGREDIENT_UNIT_LABELS[unit],
  render: () => (
    <span className="text-[13px] text-inkblack">
      {INGREDIENT_UNIT_LABELS[unit]}
    </span>
  ),
}));

export const IngredientModal = ({
  ingredient,
  onClose,
  onSuccess,
}: IngredientModalProps) => {
  const isEdit = !!ingredient;
  const { isManager } = useAuth();

  const { mutate: createIngredient, status: createStatus } =
    useCreateIngredient();
  const { mutate: updateIngredient, status: updateStatus } =
    useUpdateIngredient(ingredient?.id ?? "");
  const { mutate: deleteIngredient, status: deleteStatus } =
    useDeleteIngredient(ingredient?.id ?? "");

  const isSaving = createStatus === "pending" || updateStatus === "pending";

  const initValues: CreateIngredientForm = useMemo(() => {
    if (isEdit && ingredient) {
      return {
        id: ingredient.id,
        name: ingredient.name,
        unitOfMeasure: ingredient.unitOfMeasure,
        description: ingredient.description ?? "",
      };
    }
    return IngredientFormConfig.initialValues;
  }, [isEdit, ingredient]);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleChange: formHandleChange,
    setFieldValue,
    setFieldTouched,
    handleBlur: formHandleBlur,
    handleSubmit: formSubmitHandler,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<CreateIngredientForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: IngredientFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      if (isEdit) {
        const dto = IngredientFormConfig.mapFormToUpdateDTO(data);
        updateIngredient(dto, { onSuccess });
      } else {
        const dto = IngredientFormConfig.mapFormToCreateDTO(data);
        createIngredient(dto, { onSuccess });
      }
    },
  });

  const handleUnitChange = async (id: string) => {
    await setFieldValue("unitOfMeasure", id, true);
    await setFieldTouched("unitOfMeasure", true, false);
  };

  const handleDelete = () => {
    if (!ingredient) return;
    deleteIngredient(ingredient.id, { onSuccess });
  };

  return (
    <AppModal size="sm" maxHeightClassName="max-h-[80vh]">
      <PanelHeader
        icon={Wheat}
        title={isEdit ? "Editar insumo" : "Nuevo insumo"}
        onClose={onClose}
      />

      <form
        onSubmit={formSubmitHandler}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FormSection icon={Wheat} title="Datos del insumo">
            <FormInput
              required
              id="name"
              name="name"
              label="Nombre"
              placeholder="Ej: Carne de res, Cebolla, Sal"
              value={formValues.name}
              onChange={formHandleChange}
              onBlur={formHandleBlur}
              touched={formTouched.name}
              error={formErrors.name}
              className="h-9 rounded-xl bg-white text-[13px]"
            />

            <FormField>
              <Label required>Unidad de medida</Label>
              <AsyncDropdown<IngredientUnitEnum>
                fullWidth
                allowClear={false}
                placeholder="Seleccionar unidad"
                value={formValues.unitOfMeasure}
                options={UNIT_OPTIONS}
                onChange={(id) => handleUnitChange(id)}
                renderSelected={(unit) => INGREDIENT_UNIT_LABELS[unit]}
              />
              {formErrors.unitOfMeasure && (
                <ErrorMessage
                  touched={formTouched.unitOfMeasure}
                  error={formErrors.unitOfMeasure}
                />
              )}
            </FormField>

            <FormTextarea
              id="description"
              name="description"
              label="Descripción"
              placeholder="Ej: Res de primera, corte para asado"
              value={formValues.description ?? ""}
              onChange={(event) =>
                setFieldValue("description", event.target.value)
              }
              onBlur={formHandleBlur}
              touched={formTouched.description}
              error={formErrors.description}
              rows={3}
              helperText="Opcional. Máximo 500 caracteres."
              className="rounded-xl bg-white text-[13px]"
            />
          </FormSection>
        </div>

        <PanelFooter>
          <Button
            type="button"
            isLoading={deleteStatus === "pending"}
            disabled={isSaving || !isEdit || !isManager}
            onClick={handleDelete}
            variant="danger"
            title={
              !isManager ? "Solo un gerente puede eliminar insumos" : undefined
            }
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
            >
              {isEdit ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </PanelFooter>
      </form>
    </AppModal>
  );
};
