import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { Button } from "@/components/ui/button";
import { t } from "@/locales/es";
import { useFormik } from "formik";
import { ShiftOpenForm } from "../forms/shift.form";
import { OpenShiftFormConfig } from "../forms/shift.form-config";
import { Image } from "@/components/shared/Basics/Image";
import { ICONS } from "@/components/icons";
import { FormField } from "@/components/shared/Basics/FormField";
import { Error } from "@/components/shared/Basics/Error";
import { useOpenShiftHandler } from "../hooks/useShift";

const trans = t.pos;

export const ShiftModal = () => {
  const { mutate: openShift, status: openShiftStatus } = useOpenShiftHandler();

  const {
    touched: formTouched,
    errors: formErrors,
    setFieldValue: formSetFieldValue,
    setFieldTouched: formSetFieldTouched,
    handleSubmit: formHandleSubmit,
  } = useFormik<ShiftOpenForm>({
    enableReinitialize: true,
    initialValues: OpenShiftFormConfig.initialValues,
    validate: OpenShiftFormConfig.validationSchema,
    onSubmit: (data) => openShift(data),
  });

  return (
    <div className="absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center">
        <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-2">
          <Image src={ICONS.shift} size={24} alt="Shift" />
        </div>

        <h2 className="text-lg font-medium text-inkblack mb-1">
          {trans.shiftModal.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {trans.shiftModal.description}
        </p>

        <form onSubmit={formHandleSubmit}>
          <FormField>
            <MoneyInput
              id="amount"
              name="initialAmount"
              placeholder="0.00"
              onChange={(value) => formSetFieldValue("initialAmount", value)}
              onBlur={() => formSetFieldTouched("initialAmount", true)}
            />
            <Error
              touched={formTouched.initialAmount}
              error={formErrors.initialAmount}
            />
          </FormField>
          <Button
            type="submit"
            className="w-full mt-2 bg-brand hover:bg-brand-dark text-white font-medium"
            loading={openShiftStatus === "pending"}
          >
            {trans.shiftModal.startButton}
          </Button>
        </form>
      </div>
    </div>
  );
};
