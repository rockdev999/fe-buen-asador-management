import { zodToFormik } from "@/lib/zodToFormik";
import { payrollSchema, PayrollForm } from "../validators/payroll.schema";
import { mapPayrollFormToDTO } from "../mappers/payroll.mapper";

export const PayrollFormConfig = {
  id: "payroll-form-config",
  initialValues: {
    employeeName: "",
    roleDescription: "",
    amount: 0,
    notes: "",
  } as PayrollForm,
  validationSchema: zodToFormik(payrollSchema),
  mapFormToDTO: mapPayrollFormToDTO,
};
