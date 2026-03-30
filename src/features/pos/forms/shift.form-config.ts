import { zodToFormik } from "@/lib/zodToFormik";
import { mapShiftFormToDTO } from "../mappers/shift.mapper";
import { openShiftSchema } from "../validators/openShift.schema";
import { ShiftOpenForm } from "./shift.form";

export const OpenShiftFormConfig = {
  id: "open-shift-form-config",
  initialValues: {
    initialAmount: 0,
  } as ShiftOpenForm,
  validationSchema: zodToFormik(openShiftSchema),
  mapFormToDTO: mapShiftFormToDTO,
};
