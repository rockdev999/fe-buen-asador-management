import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { AlertTriangle, Building2, Receipt, UserCircle2 } from "lucide-react";
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
import { formatLocalDateTime } from "@/lib/formatters";
import {
  useDeleteExpense,
  useGetExpenseById,
  useUpdateExpense,
} from "../../hooks/useExpenses";
import { ExpenseCategoryOption } from "../../models/expense.model";
import { ExpenseFormConfig } from "../../forms/expense.form-config";
import { ExpenseForm } from "../../validators/expense.schema";
import { expenseCategoryLabel } from "../ExpenseColumns";

interface ExpenseModalProps {
  expenseId: string;
  categories: ExpenseCategoryOption[] | null;
  canManage: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExpenseModal = ({
  expenseId,
  categories,
  canManage,
  onClose,
  onSuccess,
}: ExpenseModalProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: expense, status: expenseStatus } =
    useGetExpenseById(expenseId);

  const { mutate: updateExpense, status: updateStatus } = useUpdateExpense(
    expenseId,
  );
  const { mutate: deleteExpense, status: deleteStatus } =
    useDeleteExpense(expenseId);

  const initValues: ExpenseForm = useMemo(() => {
    if (!expense) return ExpenseFormConfig.initialValues;
    return {
      categoryId: expense.category.id,
      description: expense.description,
      amount: expense.amount,
      receiptUrl: expense.receiptUrl ?? "",
    };
  }, [expense]);

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
  } = useFormik<ExpenseForm>({
    initialValues: initValues,
    enableReinitialize: true,
    validate: ExpenseFormConfig.validationSchema,
    onSubmit: (data) => {
      const dto = ExpenseFormConfig.mapFormToDTO(data);
      updateExpense(dto, { onSuccess });
    },
  });

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteExpense(undefined, { onSuccess });
  };

  const isLoading = expenseStatus === "pending";

  return (
    <AppModal size="md" maxHeightClassName="max-h-[85vh]">
      <PanelHeader
        icon={Receipt}
        title={canManage ? "Editar egreso" : "Detalle del egreso"}
        onClose={onClose}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current text-muted-foreground/40" />
        </div>
      ) : (
        <form
          onSubmit={formSubmitHandler}
          onReset={formHandleReset}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4">
            {expense && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                  <Building2 size={13} className="text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Sucursal
                    </p>
                    <p className="text-[12px] text-inkblack truncate">
                      {expense.location.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                  <UserCircle2 size={13} className="text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Registrado por
                    </p>
                    <p className="text-[12px] text-inkblack truncate">
                      {expense.registeredBy.name}
                    </p>
                  </div>
                </div>

                {expense.audit.createdAt && (
                  <div className="col-span-2 rounded-xl border border-surface bg-surface/30 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Fecha de registro
                    </p>
                    <p className="text-[12px] text-inkblack">
                      {formatLocalDateTime(expense.audit.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <FormSection icon={Receipt} title="Datos del egreso">
              <FormField>
                <Label required>Categoría</Label>
                <AsyncDropdown<ExpenseCategoryOption>
                  fullWidth
                  allowClear={false}
                  disabled={!canManage}
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
                disabled={!canManage}
                rows={3}
                className="rounded-xl bg-white text-[13px]"
              />

              <FormField>
                <Label required>Monto</Label>
                <MoneyInput
                  id="amount"
                  name="amount"
                  disabled={!canManage}
                  defaultValue={formValues.amount}
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
                disabled={!canManage}
                className="h-9 rounded-xl bg-white text-[13px]"
              />
            </FormSection>

            {canManage && confirmDelete && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertTriangle
                  size={14}
                  className="mt-0.5 shrink-0 text-red-500"
                />
                <p className="text-[11px] leading-4 text-red-700">
                  Esta acción eliminará el egreso de forma permanente y no se
                  puede deshacer. Presiona nuevamente “Eliminar” para
                  confirmar.
                </p>
              </div>
            )}
          </div>

          {canManage && (
            <PanelFooter>
              <Button
                type="button"
                isLoading={deleteStatus === "pending"}
                onClick={handleDelete}
                variant="danger"
              >
                {confirmDelete ? "Confirmar eliminación" : "Eliminar"}
              </Button>
              <div>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={updateStatus === "pending"}
                  disabled={!formDirty || updateStatus === "pending"}
                >
                  Guardar cambios
                </Button>
              </div>
            </PanelFooter>
          )}
        </form>
      )}
    </AppModal>
  );
};
