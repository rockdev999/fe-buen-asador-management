import { useState } from "react";
import { ORDERS_COLUMNS, ORDERS_TABLE_CONFIG } from "./OrderColumns";
import { OrderPageItem } from "../../models/order";
import { useOrdersPage } from "../../hooks/useOrder";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { SortDirection } from "@/components/shared/DataTable/types";
import { PageHeader } from "@/components/shared/DataTable/PageHeader";
import { ORDER_DROPDOWNS } from "../../config/orders.table";

export function Orders() {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(
    ORDERS_TABLE_CONFIG.defaultSorting.columnKey,
  );
  const [sortDir, setSortDir] = useState<SortDirection>(
    ORDERS_TABLE_CONFIG.defaultSorting.direction,
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<OrderPageItem | null>(null);

  const {
    data,
    meta,
    status: queryStatus,
  } = useOrdersPage({
    page,
    search: filters.search ?? "",
    status: filters.status ?? "",
    type: filters.type ?? "",
    channel: filters.channel ?? "",
    sortKey,
    sortDir,
  });

  function handleSort(key: string, dir: SortDirection) {
    setSortKey(dir ? key : "");
    setSortDir(dir);
    setPage(1);
  }

  function handleApply(newFilters: Record<string, string>) {
    setFilters(newFilters);
    setPage(1);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl">
      <PageHeader title="Pedidos" />

      <TableFilters
        searchPlaceholder="Buscar por cliente..."
        onApply={handleApply}
        dropdowns={ORDER_DROPDOWNS}
        initialValues={filters}
      />

      <DataTable
        columns={ORDERS_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={(p) => setPage(p)}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={setSelected}
        rowKey={(row) => row.id}
        emptyMessage="No hay pedidos"
        emptySubMessage="Intenta cambiar los filtros"
      />
    </div>
  );
}
