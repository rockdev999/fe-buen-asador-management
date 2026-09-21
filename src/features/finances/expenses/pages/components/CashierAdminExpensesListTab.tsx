import { useState } from "react";
import { Plus } from "lucide-react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import { Button } from "@/components/shared/Basics/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useActiveShift } from "@/features/pos/hooks/useShift";
import { useExpenseCategories, useExpensesPage } from "../../hooks/useExpenses";
import { ExpensePageItem } from "../../models/expense.model";
import {
  EXPENSES_COLUMNS,
  expenseCategoryLabel,
  isPayrollGeneratedExpense,
} from "../ExpenseColumns";
import { ExpenseModal } from "./ExpenseModal";
import { CreateExpenseModal } from "./CreateExpenseModal";

interface CashierAdminExpensesListTabProps {
  canManage: boolean;
  canCreate: boolean;
}

export function CashierAdminExpensesListTab({
  canManage,
  canCreate,
}: CashierAdminExpensesListTabProps) {
  const { user } = useAuth();
  const locationId = user?.locationId ?? "";

  const { isOpen: hasActiveShift } = useActiveShift(canCreate);

  const { page, filters, handleApply: applyFilters, handlePageChange } =
    useTableState();

  const { data: categories } = useExpenseCategories();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useExpensesPage({
    locationId,
    page,
    categoryId: filters.categoryId ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    search: filters.search ?? "",
  });

  const categoryDropdown: FilterDropdown = {
    key: "categoryId",
    placeholder: "Categoría",
    options: (categories ?? []).map((category) => ({
      value: category.id,
      label: expenseCategoryLabel(category.name),
    })),
  };

  function handleApply(newFilters: Record<string, string>) {
    applyFilters(newFilters, refetch);
  }

  const openModalForRow = (row: ExpensePageItem) => {
    if (!canManage || isPayrollGeneratedExpense(row)) return;
    setSelectedId(row.id);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TableFilters
        searchPlaceholder="Buscar por descripción..."
        onApply={handleApply}
        dropdowns={[categoryDropdown]}
        initialValues={filters}
        extraValues={{ dateFrom, dateTo }}
        onClearExtra={() => {
          setDateFrom("");
          setDateTo("");
        }}
        isLoading={queryStatus === "pending"}
        actions={
          canCreate ? (
            <Button
              size="sm"
              onClick={() => setOpenCreateModal(true)}
              disabled={!hasActiveShift}
              title={
                hasActiveShift
                  ? undefined
                  : "Necesitas un turno abierto para registrar un egreso"
              }
            >
              <Plus size={13} />
              Registrar egreso
            </Button>
          ) : undefined
        }
      >
        <FilterDateRange
          fromValue={dateFrom}
          toValue={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          max={new Date().toISOString().split("T")[0]}
        />
      </TableFilters>

      <DataTable
        columns={EXPENSES_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={handlePageChange}
        onRowClick={canManage ? openModalForRow : undefined}
        rowKey={(row) => row.id}
        emptyMessage="No hay egresos"
        emptySubMessage="Intenta cambiar los filtros"
      />

      {openModal && selectedId && (
        <ExpenseModal
          expenseId={selectedId}
          categories={categories}
          canManage={canManage}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            refetch();
          }}
        />
      )}

      {openCreateModal && (
        <CreateExpenseModal
          categories={categories}
          onClose={() => setOpenCreateModal(false)}
          onSuccess={() => {
            setOpenCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
