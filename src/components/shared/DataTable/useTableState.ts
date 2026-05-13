import { useState } from "react";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";
import { SortDirection } from "./types";

interface TableStateConfig {
  defaultSortKey?: string;
  defaultSortDir?: SortDirection;
}

export function useTableState(config: TableStateConfig = {}) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(config.defaultSortKey ?? "");
  const [sortDir, setSortDir] = useState<SortDirection>(
    config.defaultSortDir ?? SortDirectionEnum.DESC,
  );
  const [filters, setFilters] = useState<Record<string, string>>({});

  function handleSort(key: string, dir: SortDirection) {
    setSortKey(dir ? key : (config.defaultSortKey ?? ""));
    setSortDir(dir);
    setPage(1);
  }

  function handleApply(
    newFilters: Record<string, string>,
    refetch?: () => void,
  ) {
    const isSame = JSON.stringify(newFilters) === JSON.stringify(filters);
    setFilters(newFilters);
    setPage(1);
    if (isSame) {
      refetch?.();
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  return {
    page,
    sortKey,
    sortDir,
    filters,
    handleSort,
    handleApply,
    handlePageChange,
  };
}
