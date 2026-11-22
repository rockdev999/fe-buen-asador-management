import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ChefHat, Search, Wallet } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { INGREDIENT_UNIT_SHORT_LABELS } from "@/features/supplies/config/ingredient.table";
import { IngredientsReportDTO } from "../../dto/report.dto";
import { useIngredientsReport } from "../../hooks/useReports";
import {
  Delta,
  KpiCard,
  KpiGrid,
  ReportEmpty,
  ReportError,
  ReportLoading,
  ReportNote,
  ReportSection,
  ReportTabProps,
} from "./ReportBlocks";

const qty = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const formatQty = (n: number) => qty.format(n || 0);

type Item = IngredientsReportDTO["items"][number];
type SortKey = "ingredientName" | "purchased" | "consumed" | "wasted" | "remaining" | "totalCost";

const COLUMNS: { key: SortKey; label: string; numeric: boolean; hint?: string }[] = [
  { key: "ingredientName", label: "Insumo", numeric: false },
  { key: "purchased", label: "Comprado", numeric: true },
  { key: "consumed", label: "Consumido", numeric: true, hint: "Descontado por ventas" },
  { key: "wasted", label: "Merma", numeric: true },
  { key: "remaining", label: "Stock actual", numeric: true, hint: "Stock de hoy, no al cierre del periodo" },
  { key: "totalCost", label: "Costo", numeric: true, hint: "Costo de las compras del periodo" },
];

export function IngredientsReportTab({ params, previous, compareLabel }: ReportTabProps) {
  const { data: report, previous: prev, status, error, isFetching, refetch } =
    useIngredientsReport(params, previous);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "ingredientName",
    dir: "asc",
  });

  const rows = useMemo(() => {
    if (!report) return [];
    const q = search.trim().toLowerCase();
    const filtered = q
      ? report.items.filter((i) => i.ingredientName.toLowerCase().includes(q))
      : report.items;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a: Item, b: Item) =>
      sort.key === "ingredientName"
        ? a.ingredientName.localeCompare(b.ingredientName, "es") * dir
        : (a[sort.key] - b[sort.key]) * dir,
    );
  }, [report, search, sort]);

  if (status === "pending" && !report) return <ReportLoading cards={3} />;
  if (status === "error") return <ReportError error={error} onRetry={() => refetch()} />;
  if (!report) return null;

  // location null = todas las sucursales (no depende del rol).
  const isAllLocations = report.location === null;
  const withWaste = report.items.filter((i) => i.wasted > 0);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "ingredientName" ? "asc" : "desc" },
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", isFetching && "opacity-60")}>
      <KpiGrid cols={3}>
        <KpiCard
          primary
          label="Costo de compras"
          value={formatMoney(report.totalCost)}
          icon={Wallet}
          delta={
            <Delta
              current={report.totalCost}
              previous={prev?.totalCost}
              goodWhen="neutral"
              label={compareLabel}
            />
          }
        />
        <KpiCard label="Insumos con movimiento" value={report.items.length} icon={ChefHat} />
        <KpiCard
          label="Insumos con merma"
          value={withWaste.length}
          icon={AlertTriangle}
          hint={
            withWaste.length > 0
              ? `Más merma sobre lo comprado: ${[...withWaste].sort((a, b) => b.wasted / (b.purchased || 1) - a.wasted / (a.purchased || 1))[0].ingredientName}`
              : "Sin merma registrada"
          }
        />
      </KpiGrid>

      <ReportSection
        title="Movimiento de insumos"
        subtitle="Toca un encabezado para ordenar"
        aside={
          report.items.length > 0 && (
            <label className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar insumo"
                aria-label="Buscar insumo"
                className="h-8 w-44 rounded-xl border border-surface bg-surface/40 pl-8 pr-2 text-[12px] outline-none focus:border-brand/40 focus:bg-white"
              />
            </label>
          )
        }
      >
        {report.items.length === 0 ? (
          <ReportEmpty />
        ) : rows.length === 0 ? (
          <ReportEmpty message={`Ningún insumo coincide con "${search}"`} hint="" />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full min-w-[680px] text-[12px]">
              <thead>
                <tr className="border-b border-surface text-[11px] text-muted-foreground">
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      title={c.hint}
                      aria-sort={
                        sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
                      }
                      className={cn("px-4 py-2 font-medium", c.numeric ? "text-right" : "text-left")}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={cn(
                          "inline-flex items-center gap-1 hover:text-inkblack",
                          sort.key === c.key && "text-inkblack",
                          c.hint && "underline decoration-dotted underline-offset-2",
                        )}
                      >
                        {c.label}
                        {sort.key === c.key &&
                          (sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => {
                  const unit = INGREDIENT_UNIT_SHORT_LABELS[item.unit] ?? item.unit;
                  const wastePct = item.purchased > 0 ? (item.wasted / item.purchased) * 100 : 0;
                  return (
                    <tr
                      key={item.ingredientId}
                      className="border-b border-surface last:border-0 hover:bg-surface/40"
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-inkblack">{item.ingredientName}</span>
                        <span className="ml-1.5 text-[11px] text-muted-foreground">{unit}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatQty(item.purchased)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatQty(item.consumed)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {item.wasted > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-px font-medium text-red-700">
                            {formatQty(item.wasted)}
                            {wastePct > 0 && (
                              <span className="text-[10px] font-normal">({wastePct.toFixed(0)}%)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatQty(item.remaining)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-inkblack tabular-nums">
                        {formatMoney(item.totalCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {report.items.length > 0 && (
          <div className="mt-3">
            <ReportNote>
              "Stock actual" es el stock de hoy
              {isAllLocations && " (suma de todas las sucursales)"}, no el que había
              al cierre del periodo. El % de merma es sobre lo comprado en el periodo.
            </ReportNote>
          </div>
        )}
      </ReportSection>
    </div>
  );
}
