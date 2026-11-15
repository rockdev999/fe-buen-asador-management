import { ChefHat, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { INGREDIENT_UNIT_SHORT_LABELS } from "@/features/supplies/config/ingredient.table";
import { ReportParams } from "../../dto/report.dto";
import { useIngredientsReport } from "../../hooks/useReports";
import {
  ReportEmpty,
  ReportError,
  ReportLoading,
  ReportSection,
  StatCard,
} from "./ReportBlocks";

const quantityFormatter = new Intl.NumberFormat("es-BO", {
  maximumFractionDigits: 2,
});

const formatQty = (value: number) => quantityFormatter.format(value);

export function IngredientsReportTab({ params }: { params: ReportParams }) {
  const { data: report, status, error } = useIngredientsReport(params);

  if (status === "pending" && !report) return <ReportLoading />;
  if (status === "error") return <ReportError error={error} />;
  if (!report) return null;

  const isAllLocations = !params.locationId;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          label="Costo de insumos"
          value={formatMoney(report.totalCost)}
          icon={Wallet}
        />
        <StatCard label="Insumos" value={report.items.length} icon={ChefHat} />
      </div>

      <ReportSection
        title="Movimiento de insumos"
        aside={
          isAllLocations && (
            <span className="text-[11px] text-muted-foreground">
              Stock actual: suma de todas las sucursales
            </span>
          )
        }
      >
        {report.items.length === 0 ? (
          <ReportEmpty message="No hubo movimientos de insumos en este período" />
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full min-w-[640px] text-[12px]">
              <thead>
                <tr className="border-b border-surface text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2 font-semibold">Insumo</th>
                  <th className="px-4 py-2 font-semibold">Unidad</th>
                  <th className="px-4 py-2 font-semibold text-right">Compras</th>
                  <th className="px-4 py-2 font-semibold text-right">Consumo</th>
                  <th className="px-4 py-2 font-semibold text-right">Merma</th>
                  <th className="px-4 py-2 font-semibold text-right">
                    Stock actual
                  </th>
                  <th className="px-4 py-2 font-semibold text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {report.items.map((item) => (
                  <tr
                    key={item.ingredientId}
                    className="border-b border-surface last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium text-inkblack">
                      {item.ingredientName}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {INGREDIENT_UNIT_SHORT_LABELS[item.unit] ?? item.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatQty(item.purchased)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatQty(item.consumed)}
                    </td>
                    <td
                      className={
                        item.wasted > 0
                          ? "px-4 py-2.5 text-right tabular-nums text-red-500"
                          : "px-4 py-2.5 text-right tabular-nums"
                      }
                    >
                      {formatQty(item.wasted)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatQty(item.remaining)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-inkblack tabular-nums">
                      {formatMoney(item.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>
    </div>
  );
}
