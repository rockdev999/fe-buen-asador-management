import { useState } from "react";
import { ChevronDown, FileDown, FileStack, FileText } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";
import { ReportTab } from "../../config/report-tabs";
import { PdfReport } from "../../services/report-pdf";

interface Props {
  activeTab: ReportTab;
  canSummary: boolean;
  /** Rango inválido: no se puede generar. */
  disabledReason: string | null;
  pending: PdfReport | null;
  onDownload: (type: PdfReport, detail: boolean | undefined) => void;
}

// Un solo punto de exportación: qué PDF, qué trae y si lleva detalle.
// Reemplaza los botones y checkboxes sueltos para que no haya dudas sobre qué
// "Incluir detalle" afecta a qué descarga.
export function ExportMenu({
  activeTab,
  canSummary,
  disabledReason,
  pending,
  onDownload,
}: Props) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(true);
  const busy = pending !== null;

  const options: {
    type: PdfReport;
    icon: React.ElementType;
    title: string;
    description: string;
    usesDetail: boolean;
  }[] = [
    {
      type: activeTab.key,
      icon: FileText,
      title: `Reporte de ${activeTab.label.toLowerCase()}`,
      description: activeTab.pdfContent,
      usesDetail: activeTab.pdfDetail,
    },
    ...(canSummary
      ? [
          {
            type: "summary" as const,
            icon: FileStack,
            title: "Reporte general",
            description:
              "Balance del periodo (ventas − gastos) y los 4 reportes juntos. Ideal para el cierre de mes.",
            usesDetail: true,
          },
        ]
      : []),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={!!disabledReason}
          title={disabledReason ?? undefined}
          className={cn(
            "flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap",
            "bg-brand text-white hover:bg-brand/90 shadow-sm shadow-brand/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {busy ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <FileDown size={14} />
          )}
          {busy ? "Generando…" : "Exportar PDF"}
          {!busy && <ChevronDown size={13} className="opacity-70" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        // bg-popover no está definido en el tema: fondo explícito.
        className="w-[340px] rounded-2xl border-surface bg-white p-2 shadow-xl shadow-inkblack/10"
      >
        <ul className="flex flex-col gap-1">
          {options.map((o) => {
            const loading = pending === o.type;
            return (
              // El (i) va junto al título pero fuera del botón (no se anidan
              // botones). El ::after del botón cubre toda la fila para que
              // siga siendo clickeable; el (i) queda por encima (z-10).
              <li
                key={o.type}
                className="relative flex items-center gap-1.5 rounded-xl p-2.5 hover:bg-surface"
              >
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    onDownload(o.type, o.usesDetail ? detail : undefined)
                  }
                  className="flex min-w-0 items-center gap-3 text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] disabled:opacity-60 disabled:cursor-wait"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    {loading ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
                    ) : (
                      <o.icon size={15} />
                    )}
                  </span>
                  <span className="text-[13px] font-semibold text-inkblack truncate">
                    {loading ? "Generando…" : o.title}
                  </span>
                </button>
                <InfoTooltip label={`Qué incluye: ${o.title.toLowerCase()}`}>
                  {o.description}
                </InfoTooltip>
              </li>
            );
          })}
        </ul>

        {options.some((o) => o.usesDetail) && (
          <div className="mt-1 flex items-center gap-1 border-t border-surface px-2.5 pt-3 pb-1.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={detail}
                onChange={(e) => setDetail(e.target.checked)}
                className="h-3.5 w-3.5 accent-brand"
              />
              <span className="text-[12px] font-medium text-inkblack">
                Incluir detalle de gastos y nómina
              </span>
            </label>
            <InfoTooltip label="Qué es el detalle">
              Lista cada gasto y cada pago. Desmárcalo en rangos largos: el PDF
              puede tener muchas páginas.
            </InfoTooltip>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
