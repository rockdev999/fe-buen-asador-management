import { ExpenseCategoryEnum } from "@/constants";
import { Audit } from "@/types/audit.types";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ExpenseCategoryOptionDTO {
  id: UUID;
  name: ExpenseCategoryEnum;
}

export interface ExpensePageItemDTO {
  id: UUID;
  category: { id: UUID; name: string };
  description: string;
  amount: number;
  receiptUrl: string | null;
  registeredBy: { id: UUID; name: string };
  createdAt: ISODateTimeString;
}

export interface ExpenseDTO {
  id: UUID;
  category: { id: UUID; name: string };
  location: { id: UUID; name: string };
  shift: { id: UUID };
  registeredBy: { id: UUID; name: string };
  description: string;
  amount: number;
  receiptUrl: string | null;
  audit: Audit;
}

export interface CreateExpenseDTO {
  categoryId: UUID;
  description: string;
  amount: number;
  receiptUrl?: string;
}

// El backend no hace merge parcial en el PUT: siempre hay que enviar los
// 4 campos, por eso el shape es idéntico al de creación.
export type UpdateExpenseDTO = CreateExpenseDTO;

export interface ExpensesReportDTO {
  period: { from: string; to: string };
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
