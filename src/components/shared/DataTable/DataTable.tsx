import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnDef, SortDirection, TableMeta } from "./types";
import { SortDirectionEnum } from "@/constants/enums/sort.enum";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[] | null;
  meta: TableMeta | null;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  sortKey?: string;
  sortDir?: SortDirection;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  meta,
  isLoading,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  onRowClick,
  rowKey,
  emptyMessage = "Sin resultados",
  emptySubMessage = "Intenta cambiar los filtros",
}: DataTableProps<T>) {
  function handleSort(col: ColumnDef<T>) {
    if (!col.sortable || !onSort) return;
    if (sortKey !== col.key) return onSort(col.key, SortDirectionEnum.ASC);
    if (sortDir === SortDirectionEnum.ASC)
      return onSort(col.key, SortDirectionEnum.DESC);
    return onSort(col.key, null);
  }

  function SortIcon({ colKey }: { colKey: string }) {
    if (sortKey !== colKey)
      return (
        <ChevronsUpDown
          size={11}
          className="text-inkblack/20 ml-1 flex-shrink-0"
        />
      );
    if (sortDir === SortDirectionEnum.ASC)
      return <ChevronUp size={11} className="text-brand ml-1 flex-shrink-0" />;
    if (sortDir === SortDirectionEnum.DESC)
      return (
        <ChevronDown size={11} className="text-brand ml-1 flex-shrink-0" />
      );
    return (
      <ChevronsUpDown
        size={11}
        className="text-inkblack/20 ml-1 flex-shrink-0"
      />
    );
  }

  const start = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const end = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;
  const isEmpty = !isLoading && (!data || data.length === 0);

  function getPages(): (number | "...")[] {
    if (!meta) return [];
    const total = meta.totalPages;
    const curr = meta.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (curr <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (curr >= total - 3)
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", curr - 1, curr, curr + 1, "...", total];
  }

  return (
    <div className="flex-1 overflow-auto bg-surface py-3 rounded-2xl flex flex-col">
      {/* Tabla */}
      <div className="flex-1 overflow-auto bg-[#FDF9F7] rounded-2xl">
        <table className="w-full border-separate border-spacing-y-0 min-w-[500px]">
          <thead className="sticky top-0 z-10 bg-[#FDF9F7] border-b border-surface">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col)}
                  className={cn(
                    "py-3 text-left transition-colors duration-150",
                    // Fondo y rounded en cabecera
                    i === 0 && "rounded-l-xl pl-5 bg-inkblack/8",
                    i === columns.length - 1 &&
                      "rounded-r-xl pr-4 bg-inkblack/8",
                    i !== 0 && i !== columns.length - 1 && "px-4 bg-inkblack/8",
                    col.sortable &&
                      "cursor-pointer select-none hover:bg-inkblack/12",
                  )}
                >
                  <div className="flex items-center">
                    <span className="text-[10.5px] font-bold text-inkblack/70 uppercase tracking-widest">
                      {col.label}
                    </span>
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key}
                      className={cn(
                        "py-3.5 bg-surface/40",
                        colIdx === 0 && "rounded-l-xl pl-4",
                        colIdx === columns.length - 1 && "rounded-r-xl pr-4",
                        colIdx !== 0 && colIdx !== columns.length - 1 && "px-4",
                      )}
                    >
                      <div
                        className={cn(
                          "h-3 bg-surface rounded-full animate-pulse",
                          colIdx === 0 && "w-14",
                          colIdx === 1 &&
                            (rowIdx % 3 === 0
                              ? "w-32"
                              : rowIdx % 3 === 1
                                ? "w-40"
                                : "w-24"),
                          colIdx === 2 && "w-20",
                          colIdx === 3 && "w-16",
                          colIdx >= 4 && "w-12",
                        )}
                        style={{
                          animationDelay: `${(rowIdx * columns.length + colIdx) * 30}ms`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-inkblack/20"
                      >
                        <path
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <rect
                          x="9"
                          y="3"
                          width="6"
                          height="4"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M9 12h6M9 16h4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-medium text-inkblack/40">
                        {emptyMessage}
                      </p>
                      <p className="text-[12px] text-inkblack/25">
                        {emptySubMessage}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              (data ?? []).map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-all duration-150 group",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key}
                      className={cn(
                        "py-3.5 transition-colors duration-150",
                        // Fondo intercalado
                        idx % 2 === 0
                          ? "bg-white group-hover:bg-orange-50"
                          : "bg-brand/5 group-hover:bg-brand/10",
                        // Rounded en primera y última celda
                        colIdx === 0 && "rounded-l-xl pl-5",
                        colIdx === columns.length - 1 && "rounded-r-xl pr-4",
                        colIdx !== 0 && colIdx !== columns.length - 1 && "px-4",
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-6 py-3 border-t-2 border-surface bg-[#FDF9F7] flex-shrink-0 rounded-b-2xl">
        <p className="text-[12px] text-inkblack/70">
          {!meta || meta.total === 0
            ? "Sin resultados"
            : `${start}–${end} de ${meta.total}`}
        </p>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={!meta || meta.page === 1}
            onClick={() => meta && onPageChange(meta.page - 1)}
            className="
              w-8 h-8 flex items-center justify-center rounded-full
              text-inkblack/70
              hover:bg-surface hover:text-inkblack
              disabled:opacity-20 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            <ChevronLeft size={14} />
          </button>

          {getPages().map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 text-center text-[12px] text-inkblack/25"
              >
                ···
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full text-[13px] transition-all duration-150",
                  meta?.page === p
                    ? "bg-brand text-white font-medium"
                    : "text-inkblack/70 hover:bg-surface hover:text-inkblack",
                )}
              >
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={!meta || meta.page === meta.totalPages}
            onClick={() => meta && onPageChange(meta.page + 1)}
            className="
              w-8 h-8 flex items-center justify-center rounded-full
              text-inkblack/70
              hover:bg-surface hover:text-inkblack
              disabled:opacity-20 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
