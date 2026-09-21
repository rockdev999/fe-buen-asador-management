import {
  CreateExpenseDTO,
  ExpenseCategoryOptionDTO,
  ExpenseDTO,
  ExpensePageItemDTO,
  ExpensesReportDTO,
} from "../dto/expense.dto";
import {
  Expense,
  ExpenseCategoryOption,
  ExpensePageItem,
  ExpensesReport,
} from "../models/expense.model";
import { ExpenseForm } from "../validators/expense.schema";

export const mapExpenseCategoryOptionDTOToModel = (
  dto: ExpenseCategoryOptionDTO,
): ExpenseCategoryOption => ({
  id: dto.id,
  name: dto.name,
});

export const mapExpensePageItemDTOToModel = (
  dto: ExpensePageItemDTO,
): ExpensePageItem => ({
  id: dto.id,
  category: dto.category,
  description: dto.description,
  amount: dto.amount,
  receiptUrl: dto.receiptUrl,
  registeredBy: dto.registeredBy,
  createdAt: new Date(dto.createdAt),
});

export const mapExpenseDTOToModel = (dto: ExpenseDTO): Expense => ({
  id: dto.id,
  category: dto.category,
  location: dto.location,
  shiftId: dto.shift.id,
  registeredBy: dto.registeredBy,
  description: dto.description,
  amount: dto.amount,
  receiptUrl: dto.receiptUrl,
  audit: dto.audit,
});

export const mapExpensesReportDTOToModel = (
  dto: ExpensesReportDTO,
): ExpensesReport => ({
  periodFrom: dto.period.from,
  periodTo: dto.period.to,
  location: dto.location,
  totalExpenses: dto.totalExpenses,
  expensesCount: dto.expensesCount,
  byCategory: dto.byCategory,
});

export const mapExpenseFormToDTO = (
  form: ExpenseForm,
): CreateExpenseDTO => ({
  categoryId: form.categoryId,
  description: form.description,
  amount: form.amount,
  ...(form.receiptUrl && { receiptUrl: form.receiptUrl }),
});
