import { useFormik } from "formik";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { FormSection } from "@/components/shared/Form/FormSection";
import { FormInput } from "@/components/shared/Form/FormInput";
import { FormTextarea } from "@/components/shared/Form/FormTextarea";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { Button } from "@/components/shared/Basics/Button";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { AsyncDropdown } from "@/components/shared/Interactives/AsyncDropdown";
import { Receipt } from "lucide-react";
import { useCreateExpense } from "../../hooks/useExpenses";
import { ExpenseCategoryOption } from "../../models/expense.model";
import { ExpenseFormConfig } from "../../forms/expense.form-config";
import { ExpenseForm } from "../../validators/expense.schema";
import { expenseCategoryLabel } from "../ExpenseColumns";

interface CreateExpenseModalProps {
  categories: ExpenseCategoryOption[] | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateExpenseModal = ({
  categories,
  onClose,
  onSuccess,
}: CreateExpenseModalProps) => {
  const { mutate: createExpense, status: createStatus } = useCreateExpense();

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
  } = useFormik<ExpenseForm>({
    initialValues: ExpenseFormConfig.initialValues,
    validate: ExpenseFormConfig.validationSchema,
    onSubmit: (data) => {
      const dto = ExpenseFormConfig.mapFormToDTO(data);
      createExpense(dto, { onSuccess });
    },
  });

  return (
    <AppModal size="md" maxHeightClassName="max-h-[85vh]">
      <PanelHeader
        icon={Receipt}
        title="Registrar egreso"
        description="Se registrará en tu turno activo y en tu sucursal."
        onClose={onClose}
      />

      <form
        onSubmit={formSubmitHandler}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <FormSection icon={Receipt} title="Datos del egreso">
            <FormField>
              <Label required>Categoría</Label>
              <AsyncDropdown<ExpenseCategoryOption>
                fullWidth
                allowClear={false}
                placeholder="Seleccionar categoría"
                emptyText="No hay categorías disponibles"
                value={formValues.categoryId}
                options={
                  categories?.map((category) => ({
                    id: category.id,
                    data: category,
                    searchText: expenseCategoryLabel(category.name),
                    render: (item) => (
                      <span className="text-[13px] text-inkblack">
                        {expenseCategoryLabel(item.name)}
                      </span>
                    ),
                  })) ?? []
                }
                onChange={async (id) => {
                  await formSetFieldValue("categoryId", id, true);
                  await formSetFieldTouched("categoryId", true, false);
                }}
                renderSelected={(category) =>
                  expenseCategoryLabel(category.name)
                }
              />
              <ErrorMessage
                touched={formTouched.categoryId}
                error={formErrors.categoryId}
              />
            </FormField>

            <FormTextarea
              required
              id="description"
              name="description"
              label="Descripción"
              placeholder="Ej: Pago de energía eléctrica"
              value={formValues.description}
              onChange={formHandleChange}
              onBlur={formHandleBlur}
              touched={formTouched.description}
              error={formErrors.description}
              rows={3}
              className="rounded-xl bg-white text-[13px]"
            />

            <FormField>
              <Label required>Monto</Label>
              <MoneyInput
                id="amount"
                name="amount"
                onChange={(value) => formSetFieldValue("amount", value)}
                onBlur={() => formSetFieldTouched("amount", true)}
                placeholder="0.00"
                className="h-9 rounded-xl bg-white text-[13px]"
              />
              <ErrorMessage
                touched={formTouched.amount}
                error={formErrors.amount}
              />
            </FormField>

            <FormInput
              id="receiptUrl"
              name="receiptUrl"
              label="Comprobante (URL)"
              placeholder="https://..."
              value={formValues.receiptUrl ?? ""}
              onChange={formHandleChange}
              onBlur={formHandleBlur}
              touched={formTouched.receiptUrl}
              error={formErrors.receiptUrl}
              className="h-9 rounded-xl bg-white text-[13px]"
            />
          </FormSection>
        </div>

        <PanelFooter>
          <div />
          <div>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createStatus === "pending"}>
              Registrar egreso
            </Button>
          </div>
        </PanelFooter>
      </form>
    </AppModal>
  );
};
