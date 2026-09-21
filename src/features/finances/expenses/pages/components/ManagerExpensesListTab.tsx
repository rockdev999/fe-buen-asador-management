import { useState } from "react";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { FilterDateRange } from "@/components/shared/DataTable/components/FilterDateRange";
import { useTableState } from "@/components/shared/DataTable/useTableState";
import {
  AsyncDropdown,
  AsyncDropdownOption,
} from "@/components/shared/Interactives/AsyncDropdown";
import { useGetLocationSimple } from "@/features/locations/hooks/useLocation";
import { useExpenseCategories, useExpensesPage } from "../../hooks/useExpenses";
import { ExpensePageItem } from "../../models/expense.model";
import {
  EXPENSES_COLUMNS,
  expenseCategoryLabel,
  isPayrollGeneratedExpense,
} from "../ExpenseColumns";
import { ExpenseModal } from "./ExpenseModal";
import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";

export function ManagerExpensesListTab() {
  const {
    page,
    filters,
    handleApply: applyFilters,
    handlePageChange,
  } = useTableState();

  const { data: locations, status: locationsStatus } = useGetLocationSimple();
  const { data: categories } = useExpenseCategories();

  const [locationId, setLocationId] = useState(filters.locationId ?? "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeLocationId = filters.locationId ?? "";

  const {
    data,
    meta,
    status: queryStatus,
    refetch,
  } = useExpensesPage({
    locationId: activeLocationId,
    page,
    categoryId: filters.categoryId ?? "",
    dateFrom: filters.dateFrom ?? "",
    dateTo: filters.dateTo ?? "",
    search: filters.search ?? "",
  });

  const locationOptions: AsyncDropdownOption<{ id: string; name: string }>[] =
    (locations ?? []).map((loc) => ({
      id: loc.id,
      data: loc,
      searchText: loc.name,
      render: (item) => <span>{item.name}</span>,
    }));

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
    if (isPayrollGeneratedExpense(row)) return;
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
        extraValues={{ locationId, dateFrom, dateTo }}
        onClearExtra={() => {
          setLocationId("");
          setDateFrom("");
          setDateTo("");
        }}
        isLoading={queryStatus === "pending"}
      >
        <AsyncDropdown
          placeholder="Sucursal"
          value={locationId ?? filters.locationId ?? ""}
          onChange={(id) => setLocationId(id)}
          options={locationOptions}
          isLoading={locationsStatus === "pending"}
          emptyText="Sin sucursales"
        />
        <FilterDateRange
          fromValue={dateFrom}
          toValue={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          max={new Date().toISOString().split("T")[0]}
        />
      </TableFilters>

      {!activeLocationId ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-inkblack/40">
            Selecciona una sucursal para ver sus egresos.
          </p>
        </div>
      ) : (
        <DataTable
          columns={EXPENSES_COLUMNS}
          data={data}
          meta={meta}
          isLoading={queryStatus === "pending"}
          onPageChange={handlePageChange}
          onRowClick={openModalForRow}
          rowKey={(row) => row.id}
          emptyMessage="No hay egresos"
          emptySubMessage="Intenta cambiar los filtros"
        />
      )}

      {openModal && selectedId && (
        <ExpenseModal
          expenseId={selectedId}
          categories={categories}
          canManage
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            refetch();
          }}
        />
      )}
    </div>
  );
}
