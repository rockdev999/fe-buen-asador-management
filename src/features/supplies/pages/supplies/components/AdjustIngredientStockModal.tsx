import { useFormik } from "formik";
import { AlertCircle, Info, PackagePlus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { AdjustmentType } from "@/constants";
import { IngredientStock } from "../../../models/ingredient.model";
import { useAdjustIngredientStock } from "../../../hooks/useIngredientStock";
import { AdjustIngredientStockFormConfig } from "../../../forms/ingredient-stock.form-config";
import { AdjustIngredientStockForm } from "../../../validators/ingredient-stock.schema";
import {
  ADJUSTMENT_TYPE_LABELS,
  INGREDIENT_UNIT_LABELS,
} from "../../../config/ingredient.table";

interface AdjustIngredientStockModalProps {
  stockItem: IngredientStock;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdjustIngredientStockModal = ({
  stockItem,
  onClose,
  onSuccess,
}: AdjustIngredientStockModalProps) => {
  const { mutate: adjustStock, status: adjustStatus } =
    useAdjustIngredientStock(stockItem.location.id);

  const {
    values: formValues,
    touched: formTouched,
    errors: formErrors,
    handleBlur: formHandleBlur,
    setFieldValue,
    handleSubmit: formHandleSubmit,
    handleReset: formHandleReset,
  } = useFormik<AdjustIngredientStockForm>({
    initialValues: {
      ...AdjustIngredientStockFormConfig.initialValues,
      ingredientId: stockItem.ingredient.id,
    },
    validate: AdjustIngredientStockFormConfig.validationSchemaCreate,
    onSubmit: (data) => {
      const dto = AdjustIngredientStockFormConfig.mapFormToDTO(data);
      adjustStock(dto, { onSuccess });
    },
  });

  const isAdd = formValues.adjustmentType === AdjustmentType.ADD;
  const unitLabel = INGREDIENT_UNIT_LABELS[stockItem.ingredient.unitOfMeasure];

  const previewQuantity = isAdd
    ? stockItem.currentQuantity + (formValues.quantity || 0)
    : formValues.adjustmentType === AdjustmentType.SUBTRACT
      ? Math.max(0, stockItem.currentQuantity - (formValues.quantity || 0))
      : formValues.quantity || 0;

  return (
    <AppModal size="lg" maxHeightClassName="max-h-[85vh]" contentClassName="max-w-lg">
      <PanelHeader
        icon={PackagePlus}
        title="Ajustar stock de insumo"
        description={`${stockItem.ingredient.name} · ${stockItem.location.name}`}
        onClose={onClose}
      />

      <form
        onSubmit={formHandleSubmit}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FormSection icon={PackagePlus} title="Ajuste de inventario">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-surface bg-surface/20 p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Stock actual
                </p>
                <p className="text-[15px] font-semibold text-inkblack tabular-nums">
                  {stockItem.currentQuantity}{" "}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {unitLabel}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Stock mínimo
                </p>
                <p className="text-[15px] font-semibold text-inkblack tabular-nums">
                  {stockItem.minimumStock}
                </p>
              </div>
            </div>

            <FormField>
              <Label required>Tipo de ajuste</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(AdjustmentType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFieldValue("adjustmentType", type)}
                    className={cn(
                      "h-9 rounded-xl border text-[12px] font-medium transition-all",
                      formValues.adjustmentType === type
                        ? "border-brand/40 bg-brand/8 text-brand"
                        : "border-surface bg-surface/40 text-inkblack/50 hover:border-inkblack/20 hover:bg-surface hover:text-inkblack",
                    )}
                  >
                    {ADJUSTMENT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </FormField>

            <FormInput
              required
              id="quantity"
              name="quantity"
              label="Cantidad"
              type="number"
              min={0}
              placeholder="Ej: 10"
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

            {isAdd && (
              <FormField>
                <Label>Costo unitario</Label>
                <MoneyInput
                  id="unitCost"
                  name="unitCost"
                  defaultValue={formValues.unitCost}
                  onChange={(value) =>
                    setFieldValue("unitCost", value || undefined)
                  }
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
                <p className="text-[10px] text-muted-foreground">
                  Opcional. Solo se guarda cuando el ajuste es de tipo
                  &quot;Agregar&quot;.
                </p>
              </FormField>
            )}

            <FormTextarea
              id="notes"
              name="notes"
              label="Notas"
              placeholder="Ej: Compra a proveedor"
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
                Nuevo stock resultante:{" "}
                <span className="font-semibold">
                  {previewQuantity} {unitLabel}
                </span>
              </p>
            </div>

            {previewQuantity < stockItem.minimumStock && (
              <div className="flex items-start gap-1.5 rounded-lg bg-yellow-50 px-2 py-1.5">
                <AlertCircle size={12} className="mt-0.5 shrink-0 text-yellow-600" />
                <p className="text-[10px] leading-4 text-yellow-700">
                  El nuevo stock quedará por debajo del mínimo establecido.
                </p>
              </div>
            )}
          </FormSection>
        </div>

        <PanelFooter align="right">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={adjustStatus === "pending"}>
            Ajustar stock
          </Button>
        </PanelFooter>
      </form>
    </AppModal>
  );
};
