import { useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RangeDatePicker } from "@/components/shared/Interactives/datePicker.tsx/DatePicker";
import { cn } from "@/lib/utils";
import {
  DateRange,
  formatReportMonth,
  MAX_MONTHS_RANGE,
  monthRange,
  monthsBetween,
  QUICK_PERIODS,
  REPORT_PERIOD_OPTIONS,
  ReportPeriodMode,
  ymd,
} from "../../utils/report-period";

interface Props {
  mode: ReportPeriodMode;
  range: DateRange;
  error: string | null;
  onModeChange: (mode: ReportPeriodMode) => void;
  onRangeChange: (range: DateRange) => void;
}

const TRIGGER = "h-9 rounded-xl border-surface bg-surface/40 text-[12px] focus:ring-brand/30";

// Los periodos más usados quedan a un clic (botones); el resto va en "Más…".
// Al elegir "Rango de meses" o "Personalizado" aparecen sus controles al lado.
export function ReportPeriodPicker({ mode, range, error, onModeChange, onRangeChange }: Props) {
  const quick = REPORT_PERIOD_OPTIONS.filter((o) => QUICK_PERIODS.includes(o.value));
  const more = REPORT_PERIOD_OPTIONS.filter(
    (o) => !QUICK_PERIODS.includes(o.value) && o.value !== "months" && o.value !== "custom",
  );
  const ranges = REPORT_PERIOD_OPTIONS.filter((o) => o.value === "months" || o.value === "custom");
  const isQuick = QUICK_PERIODS.includes(mode);

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="radiogroup"
          aria-label="Periodo"
          className="flex items-center gap-0.5 rounded-xl bg-surface/70 p-1 overflow-x-auto"
        >
          {quick.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={mode === o.value}
              onClick={() => onModeChange(o.value)}
              className={cn(
                "h-7 px-3 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all",
                mode === o.value
                  ? "bg-white text-brand shadow-sm"
                  : "text-inkblack/60 hover:text-inkblack",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <Select
          // "" muestra el placeholder cuando el periodo activo es un botón.
          value={isQuick ? "" : mode}
          onValueChange={(v) => onModeChange(v as ReportPeriodMode)}
        >
          <SelectTrigger
            aria-label="Más periodos"
            className={cn(
              TRIGGER,
              "w-auto min-w-[120px] gap-2",
              !isQuick && "border-brand/40 bg-brand/[0.06] text-brand font-medium",
            )}
          >
            <SelectValue placeholder="Más periodos" />
          </SelectTrigger>
          <SelectContent>
            {more.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
            <SelectSeparator />
            {ranges.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}…
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {mode === "custom" && (
          <CustomRange
            key={`${range.dateFrom}_${range.dateTo}`}
            range={range}
            onChange={onRangeChange}
          />
        )}
        {mode === "months" && <MonthsRange range={range} onChange={onRangeChange} />}
      </div>
      {error && (
        <span role="alert" className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle size={11} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Personalizado ───────────────────────────────────────────────────────────
// El calendario emite "desde" y "hasta" por separado; se guarda un borrador
// local y solo se aplica (y se consulta) cuando están las dos fechas.

function CustomRange({
  range,
  onChange,
}: {
  range: DateRange;
  onChange: (r: DateRange) => void;
}) {
  // El padre lo remonta (key) cuando cambia el rango aplicado.
  const [draft, setDraft] = useState(range);

  // RangeDatePicker llama onFromChange y luego onToChange en el mismo evento
  // (incluido el botón de limpiar): se guarda el "desde" y se aplica al
  // recibir el "hasta". selectsRange ya impide elegir "hasta" antes de "desde".
  const fromRef = useRef(draft.dateFrom);

  function handleTo(dateTo: string) {
    const next = { dateFrom: fromRef.current, dateTo };
    setDraft(next);
    if (next.dateFrom && next.dateTo) onChange(next);
  }

  return (
    <RangeDatePicker
      className="w-[240px]"
      fromValue={draft.dateFrom}
      toValue={draft.dateTo}
      onFromChange={(dateFrom) => {
        fromRef.current = dateFrom;
      }}
      onToChange={handleTo}
    />
  );
}

// ─── Rango de meses ──────────────────────────────────────────────────────────

const MONTHS_BACK = 36;

function MonthsRange({
  range,
  onChange,
}: {
  range: DateRange;
  onChange: (r: DateRange) => void;
}) {
  // Últimos 36 meses hasta el actual, del más reciente al más antiguo.
  const options = useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_BACK }, (_, i) =>
      ymd(new Date(now.getFullYear(), now.getMonth() - i, 1)).slice(0, 7),
    );
  }, []);

  const fromYm = range.dateFrom.slice(0, 7) || options[0];
  const toYm = range.dateTo.slice(0, 7) || fromYm;

  function setFrom(ym: string) {
    // Si "hasta" queda antes o a más de 12 meses, se ajusta.
    let to = toYm;
    const n = monthsBetween(ym, to);
    if (n < 1) to = ym;
    else if (n > MAX_MONTHS_RANGE) to = shiftYm(ym, MAX_MONTHS_RANGE - 1);
    onChange(monthRange(ym, to));
  }

  function setTo(ym: string) {
    onChange(monthRange(fromYm, ym));
  }

  return (
    <div className="flex items-center gap-1.5">
      <MonthSelect label="Desde" value={fromYm} options={options} onChange={setFrom} />
      <span className="text-muted-foreground text-[12px]">a</span>
      <MonthSelect
        label="Hasta"
        value={toYm}
        // Solo meses posteriores a "desde" y dentro de los 12.
        options={options.filter((ym) => {
          const n = monthsBetween(fromYm, ym);
          return n >= 1 && n <= MAX_MONTHS_RANGE;
        })}
        onChange={setTo}
      />
    </div>
  );
}

function shiftYm(ym: string, months: number) {
  const [y, m] = ym.split("-").map(Number);
  return ymd(new Date(y, m - 1 + months, 1)).slice(0, 7);
}

function MonthSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (ym: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className={cn(TRIGGER, "w-[120px]")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((ym) => (
          <SelectItem key={ym} value={ym}>
            {formatReportMonth(ym)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
