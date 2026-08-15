import { useFormik } from "formik";
import { useMemo } from "react";
import { ChefHat, Plus, Trash2 } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { FormSection } from "@/components/shared/Form/FormSection";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { Button } from "@/components/shared/Basics/Button";
import { Input } from "@/components/ui/input";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProductsHandler } from "@/features/catalog/products/hooks/useProducts";
import { Recipe } from "../../../models/recipe.model";
import { useIngredientsSimpleHandler } from "../../../hooks/useIngredients";
import {
  useCreateRecipe,
  useDeleteRecipe,
  useUpdateRecipe,
} from "../../../hooks/useRecipes";
import {
  CreateRecipeFormConfig,
  UpdateRecipeQuantityFormConfig,
} from "../../../forms/recipe.form-config";
import {
  CreateRecipeForm,
  UpdateRecipeQuantityForm,
} from "../../../validators/recipe.schema";
import { INGREDIENT_UNIT_LABELS } from "../../../config/ingredient.table";

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecipeModal = ({
  recipe,
  onClose,
  onSuccess,
}: RecipeModalProps) => {
  const isEdit = !!recipe;

  return isEdit ? (
    <EditRecipeModal recipe={recipe} onClose={onClose} onSuccess={onSuccess} />
  ) : (
    <CreateRecipeModal onClose={onClose} onSuccess={onSuccess} />
  );
};

// ─── Crear receta (producto + N insumos en un solo envío) ─────────────────

interface CreateRecipeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_ROW = { ingredientId: "", quantityUsed: 0 };

const CreateRecipeModal = ({ onClose, onSuccess }: CreateRecipeModalProps) => {
  const { data: products, status: productsStatus } = useProductsHandler();
  const { data: ingredients, status: ingredientsStatus } =
    useIngredientsSimpleHandler();

  const { mutate: createRecipe, status: createStatus } = useCreateRecipe();
  const isSaving = createStatus === "pending";

  const {
    values: formValues,
    errors: formErrors,
    setFieldValue,
    handleSubmit: formSubmitHandler,
    handleReset: formHandleReset,
  } = useFormik<CreateRecipeForm>({
    initialValues: CreateRecipeFormConfig.initialValues,
    validate: CreateRecipeFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = CreateRecipeFormConfig.mapFormToDTO(data);
      createRecipe(dto, { onSuccess });
    },
  });

  const productOptions: AsyncDropdownOption<{ id: string; name: string }>[] = (
    products ?? []
  ).map((product) => ({
    id: product.id,
    data: product,
    searchText: product.name,
    render: (item) => (
      <span className="text-[13px] text-inkblack">{item.name}</span>
    ),
  }));

  const ingredientOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (ingredients ?? []).map((ingredient) => ({
      id: ingredient.id,
      data: ingredient,
      searchText: ingredient.name,
      render: (item) => (
        <span className="text-[13px] text-inkblack">{item.name}</span>
      ),
    }));

  const selectedIngredientIds = formValues.ingredients.map(
    (row) => row.ingredientId,
  );

  const handleProductChange = (id: string) => {
    setFieldValue("productId", id, true);
  };

  const handleRowIngredientChange = (index: number, id: string) => {
    const next = formValues.ingredients.map((row, i) =>
      i === index ? { ...row, ingredientId: id } : row,
    );
    setFieldValue("ingredients", next, true);
  };

  const handleRowQuantityChange = (index: number, value: string) => {
    const next = formValues.ingredients.map((row, i) =>
      i === index
        ? { ...row, quantityUsed: value === "" ? 0 : Number(value) }
        : row,
    );
    setFieldValue("ingredients", next, true);
  };

  const handleAddRow = () => {
    setFieldValue("ingredients", [...formValues.ingredients, { ...EMPTY_ROW }]);
  };

  const handleRemoveRow = (index: number) => {
    const next = formValues.ingredients.filter((_, i) => i !== index);
    setFieldValue(
      "ingredients",
      next.length > 0 ? next : [{ ...EMPTY_ROW }],
      true,
    );
  };

  const ingredientsError =
    typeof formErrors.ingredients === "string"
      ? formErrors.ingredients
      : undefined;

  return (
    <AppModal
      size="lg"
      maxHeightClassName="max-h-[85vh]"
      contentClassName="max-w-lg"
    >
      <PanelHeader
        icon={ChefHat}
        title="Nueva receta"
        description="Define cuánto consume el producto de cada insumo por unidad vendida."
        onClose={onClose}
      />

      <form
        onSubmit={formSubmitHandler}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FormSection icon={ChefHat} title="Producto">
            <FormField>
              <Label required>Producto</Label>
              <AsyncDropdown<{ id: string; name: string }>
                fullWidth
                searchable
                allowClear={false}
                isLoading={productsStatus === "pending"}
                placeholder="Seleccionar producto"
                emptyText="No hay productos disponibles"
                value={formValues.productId}
                options={productOptions}
                onChange={(id) => handleProductChange(id)}
                renderSelected={(product) => product.name}
              />
              {formErrors.productId && (
                <ErrorMessage error={formErrors.productId} touched />
              )}
            </FormField>
          </FormSection>

          <FormSection
            icon={ChefHat}
            title="Insumos"
            description="Agrega uno o más insumos con la cantidad que consume el producto."
            className="mt-3 border-t border-surface pt-3"
          >
            <div className="flex flex-col gap-2">
              {formValues.ingredients.map((row, index) => {
                const otherSelected = selectedIngredientIds.filter(
                  (_, i) => i !== index,
                );
                const rowOptions = ingredientOptions.filter(
                  (opt) => !otherSelected.includes(opt.id),
                );
                const rowIngredient = ingredients?.find(
                  (ingredient) => ingredient.id === row.ingredientId,
                );

                return (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <AsyncDropdown<{ id: string; name: string }>
                        fullWidth
                        searchable
                        allowClear={false}
                        isLoading={ingredientsStatus === "pending"}
                        placeholder="Seleccionar insumo"
                        emptyText="No hay insumos disponibles"
                        value={row.ingredientId}
                        options={rowOptions}
                        onChange={(id) => handleRowIngredientChange(index, id)}
                        renderSelected={(ingredient) => ingredient.name}
                      />
                    </div>

                    <div className="w-24 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        placeholder="Cant."
                        value={row.quantityUsed || ""}
                        onChange={(event) =>
                          handleRowQuantityChange(index, event.target.value)
                        }
                        className="h-9 rounded-xl bg-white text-[13px]"
                        title={
                          rowIngredient
                            ? INGREDIENT_UNIT_LABELS[
                                rowIngredient.unitOfMeasure
                              ]
                            : undefined
                        }
                      />
                    </div>

                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      onClick={() => handleRemoveRow(index)}
                      disabled={formValues.ingredients.length === 1}
                      title="Quitar insumo"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                );
              })}
            </div>

            {ingredientsError && (
              <ErrorMessage error={ingredientsError} touched />
            )}

            <Button
              type="button"
              variant="dashed"
              size="sm"
              onClick={handleAddRow}
              className="w-full justify-center"
            >
              <Plus size={13} />
              Agregar insumo
            </Button>

            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">
              <ChefHat size={13} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-[11px] leading-4 text-blue-700">
                Al crear la receta se registrará el stock de cada insumo en 0 en
                las sucursales donde el producto ya esté habilitado.
              </p>
            </div>
          </FormSection>
        </div>

        <PanelFooter align="right">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Crear receta
          </Button>
        </PanelFooter>
      </form>
    </AppModal>
  );
};

// ─── Editar receta (solo la cantidad de un insumo ya asignado) ────────────

interface EditRecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onSuccess: () => void;
}

const EditRecipeModal = ({
  recipe,
  onClose,
  onSuccess,
}: EditRecipeModalProps) => {
  const { isManager } = useAuth();

  const { mutate: updateRecipe, status: updateStatus } = useUpdateRecipe(
    recipe.id,
  );
  const { mutate: deleteRecipe, status: deleteStatus } = useDeleteRecipe(
    recipe.id,
  );

  const isSaving = updateStatus === "pending";

  const initValues: UpdateRecipeQuantityForm = useMemo(
    () => ({ quantityUsed: recipe.quantityUsed }),
    [recipe.quantityUsed],
  );

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    setFieldValue,
    handleBlur: formHandleBlur,
    handleSubmit: formSubmitHandler,
    handleReset: formHandleReset,
    dirty: formDirty,
  } = useFormik<UpdateRecipeQuantityForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: UpdateRecipeQuantityFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = UpdateRecipeQuantityFormConfig.mapFormToDTO(data);
      updateRecipe(dto, { onSuccess });
    },
  });

  const handleDelete = () => {
    deleteRecipe(recipe.id, { onSuccess });
  };

  return (
    <AppModal size="sm" maxHeightClassName="max-h-[80vh]">
      <PanelHeader
        icon={ChefHat}
        title="Editar receta"
        description="El producto y el insumo no se pueden cambiar; solo la cantidad."
        onClose={onClose}
      />

      <form
        onSubmit={formSubmitHandler}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FormSection icon={ChefHat} title="Datos de la receta">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-surface bg-surface/20 p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Producto
                </p>
                <p className="text-[13px] font-medium text-inkblack truncate">
                  {recipe.product.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Insumo
                </p>
                <p className="text-[13px] font-medium text-inkblack truncate">
                  {recipe.ingredient.name}
                </p>
              </div>
            </div>

            <FormField>
              <Label required>Cantidad utilizada</Label>
              <Input
                type="number"
                min={0}
                placeholder="Ej: 0.25"
                value={formValues.quantityUsed}
                onChange={(event) => {
                  const value = event.target.value;
                  setFieldValue(
                    "quantityUsed",
                    value === "" ? 0 : Number(value),
                  );
                }}
                onBlur={formHandleBlur}
                className="h-9 rounded-xl bg-white text-[13px]"
              />
              <ErrorMessage
                touched={formTouched.quantityUsed}
                error={formErrors.quantityUsed}
                hint={`Cantidad de ${INGREDIENT_UNIT_LABELS[recipe.ingredient.unitOfMeasure]} consumida por cada unidad vendida.`}
              />
            </FormField>
          </FormSection>
        </div>

        <PanelFooter>
          <Button
            type="button"
            isLoading={deleteStatus === "pending"}
            disabled={isSaving || !isManager}
            onClick={handleDelete}
            variant="danger"
            title={
              !isManager ? "Solo un gerente puede eliminar recetas" : undefined
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
              disabled={!formDirty || isSaving}
            >
              Actualizar
            </Button>
          </div>
        </PanelFooter>
      </form>
    </AppModal>
  );
};
