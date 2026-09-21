import { useFormik } from "formik";
import { UserCheck } from "lucide-react";
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
import { JOB_POSITION_OPTIONS } from "@/utils/generalStatus/job-display";
import { useCreatePayroll } from "../../hooks/usePayroll";
import { PayrollFormConfig } from "../../forms/payroll.form-config";
import { PayrollForm } from "../../validators/payroll.schema";

interface CreatePayrollModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePayrollModal = ({
  onClose,
  onSuccess,
}: CreatePayrollModalProps) => {
  const { mutate: createPayroll, status: createStatus } = useCreatePayroll();

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
  } = useFormik<PayrollForm>({
    initialValues: PayrollFormConfig.initialValues,
    validate: PayrollFormConfig.validationSchema,
    onSubmit: (data) => {
      const dto = PayrollFormConfig.mapFormToDTO(data);
      createPayroll(dto, { onSuccess });
    },
  });

  return (
    <AppModal size="md" maxHeightClassName="max-h-[85vh]">
      <PanelHeader
        icon={UserCheck}
        title="Registrar pago de nómina"
        description="Se registrará en tu turno activo y en tu sucursal."
        onClose={onClose}
      />

      <form
        onSubmit={formSubmitHandler}
        onReset={formHandleReset}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <FormSection icon={UserCheck} title="Datos del pago">
            <FormInput
              required
              id="employeeName"
              name="employeeName"
              label="Nombre del empleado"
              placeholder="Ej: Juan Pérez"
              value={formValues.employeeName}
              onChange={formHandleChange}
              onBlur={formHandleBlur}
              touched={formTouched.employeeName}
              error={formErrors.employeeName}
              className="h-9 rounded-xl bg-white text-[13px]"
            />

            <FormField>
              <Label>Cargo</Label>
              <input
                id="roleDescription"
                name="roleDescription"
                list="job-position-suggestions"
                placeholder="Ej: Cocinero"
                value={formValues.roleDescription ?? ""}
                onChange={formHandleChange}
                onBlur={formHandleBlur}
                className="flex h-9 w-full rounded-xl border border-input bg-white px-3 py-2 text-[13px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <datalist id="job-position-suggestions">
                {JOB_POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.label} />
                ))}
              </datalist>
              <ErrorMessage
                touched={formTouched.roleDescription}
                error={formErrors.roleDescription}
              />
            </FormField>

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

            <FormTextarea
              id="notes"
              name="notes"
              label="Notas"
              placeholder="Observaciones opcionales"
              value={formValues.notes ?? ""}
              onChange={formHandleChange}
              onBlur={formHandleBlur}
              touched={formTouched.notes}
              error={formErrors.notes}
              rows={3}
              className="rounded-xl bg-white text-[13px]"
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
              Registrar pago
            </Button>
          </div>
        </PanelFooter>
      </form>
    </AppModal>
  );
};
