import { zodToFormik } from "@/lib/zodToFormik";
import { expenseSchema, ExpenseForm } from "../validators/expense.schema";
import { mapExpenseFormToDTO } from "../mappers/expense.mapper";

// Compartido entre crear y editar — el backend usa el mismo shape para ambos.
export const ExpenseFormConfig = {
  id: "expense-form-config",
  initialValues: {
    categoryId: "",
    description: "",
    amount: 0,
    receiptUrl: "",
  } as ExpenseForm,
  validationSchema: zodToFormik(expenseSchema),
  mapFormToDTO: mapExpenseFormToDTO,
};
