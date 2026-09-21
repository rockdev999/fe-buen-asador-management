import { ExpenseCategoryEnum } from "@/constants";
import { Audit } from "@/types/audit.types";
import { UUID } from "@/types/common";

export interface ExpenseCategoryOption {
  id: UUID;
  name: ExpenseCategoryEnum;
}

export interface ExpensePageItem {
  id: UUID;
  category: { id: UUID; name: string };
  description: string;
  amount: number;
  receiptUrl: string | null;
  registeredBy: { id: UUID; name: string };
  createdAt: Date;
}

export interface Expense {
  id: UUID;
  category: { id: UUID; name: string };
  location: { id: UUID; name: string };
  shiftId: UUID;
  registeredBy: { id: UUID; name: string };
  description: string;
  amount: number;
  receiptUrl: string | null;
  audit: Audit;
}

export interface ExpensesReport {
  periodFrom: string;
  periodTo: string;
  location: { id: UUID; name: string };
  totalExpenses: number;
  expensesCount: number;
  byCategory: {
    categoryId: UUID;
    categoryName: string;
    total: number;
    count: number;
  }[];
}
