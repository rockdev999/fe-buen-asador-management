import { useState } from "react";
import { ORDERS_COLUMNS, ORDERS_TABLE_CONFIG } from "./OrderColumns";
import { OrderPageItem } from "../../models/order";
import { useOrdersPage } from "../../hooks/useOrder";
import { TableFilters } from "@/components/shared/DataTable/TableFilters";
import { DataTable } from "@/components/shared/DataTable/DataTable";
import { SortDirection } from "@/components/shared/DataTable/types";

export function Orders() {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(
    ORDERS_TABLE_CONFIG.defaultSorting.columnKey,
  );
  const [sortDir, setSortDir] = useState<SortDirection>(
    ORDERS_TABLE_CONFIG.defaultSorting.direction,
  );
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OrderPageItem | null>(null);

  const {
    data,
    meta,
    status: queryStatus,
  } = useOrdersPage({
    page,
    search,
    status,
    sortKey,
    sortDir,
  });

  function handleSort(key: string, dir: SortDirection) {
    setSortKey(dir ? key : "");
    setSortDir(dir);
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleChip(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-5 py-3.5 border-b border-surface bg-white flex-shrink-0">
        <h1 className="text-sm font-medium text-inkblack">Pedidos</h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {meta?.total} pedidos en total
        </p>
      </div>

      {/* Filtros */}
      <TableFilters
        searchPlaceholder="Buscar por cliente..."
        onSearch={handleSearch}
        chips={ORDERS_STATUS_CHIPS}
        activeChip={status}
        onChipChange={handleChip}
      />

      {/* Tabla */}
      <DataTable
        columns={ORDERS_COLUMNS}
        data={data}
        meta={meta}
        isLoading={queryStatus === "pending"}
        onPageChange={setPage}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        onRowClick={setSelected}
        rowKey={(row) => row.id}
      />

      {/* {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
        />
      )} */}
    </div>
  );
}
