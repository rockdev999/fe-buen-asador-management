// src/components/shared/Interactives/DatePicker.tsx
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

registerLocale("es", es);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Shared trigger styles ────────────────────────────────────────────────────

const TRIGGER_BASE = cn(
  "flex items-center gap-2 h-9 px-3.5 rounded-xl border text-[13px]",
  "transition-all duration-200 cursor-pointer w-full",
);
const TRIGGER_ACTIVE = "border-brand/40 bg-brand/8 text-brand font-medium";
const TRIGGER_IDLE = cn(
  "border-surface bg-surface/40 text-inkblack/50",
  "hover:border-inkblack/20 hover:bg-surface hover:text-inkblack",
);

// ─── Custom Input ─────────────────────────────────────────────────────────────

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  onClear?: (e: React.MouseEvent) => void;
  placeholder?: string;
  hasValue?: boolean;
  className?: string;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ value, onClick, onClear, placeholder, hasValue, className }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        TRIGGER_BASE,
        hasValue ? TRIGGER_ACTIVE : TRIGGER_IDLE,
        className,
      )}
    >
      <Calendar size={13} className="flex-shrink-0 opacity-60 flex-shrink-0" />
      <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
        {value || placeholder}
      </span>
      {hasValue && onClear && (
        <span
          onClick={onClear}
          className="ml-1 text-brand/50 hover:text-brand transition-colors"
        >
          <X size={11} />
        </span>
      )}
    </button>
  ),
);
CustomInput.displayName = "CustomInput";

// ─── SingleDatePicker ─────────────────────────────────────────────────────────

interface SingleDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function SingleDatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  min,
  max,
  label,
  className,
  disabled,
}: SingleDatePickerProps) {
  const hasValue = !!value;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      )}
      <ReactDatePicker
        selected={toDate(value)}
        onChange={(date: Date | null) => onChange(date ? toStr(date) : "")}
        locale="es"
        dateFormat="dd/MM/yyyy"
        minDate={min ? (toDate(min) ?? undefined) : undefined}
        maxDate={max ? (toDate(max) ?? undefined) : undefined}
        disabled={disabled}
        popperClassName="custom-datepicker-popper"
        calendarClassName="custom-datepicker"
        showPopperArrow={false}
        showMonthDropdown
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={10}
        dropdownMode="select"
        customInput={
          <CustomInput
            placeholder={placeholder}
            hasValue={hasValue}
            onClear={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        }
      />
    </div>
  );
}

// ─── RangeDatePicker ──────────────────────────────────────────────────────────

interface RangeDatePickerProps {
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  placeholder?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  min?: string;
  max?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function RangeDatePicker({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  placeholder = "Rango de fechas",
  fromPlaceholder = "Desde",
  toPlaceholder = "Hasta",
  min,
  max,
  label,
  className,
  disabled,
}: RangeDatePickerProps) {
  const hasAny = !!fromValue || !!toValue;

  const displayValue = hasAny
    ? [
        fromValue
          ? toDate(fromValue)!.toLocaleDateString("es-BO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : fromPlaceholder,
        toValue
          ? toDate(toValue)!.toLocaleDateString("es-BO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : toPlaceholder,
      ].join(" — ")
    : placeholder;

  function handleChange(dates: [Date | null, Date | null]) {
    const [start, end] = dates;
    onFromChange(start ? toStr(start) : "");
    onToChange(end ? toStr(end) : "");
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      )}
      <ReactDatePicker
        selectsRange
        startDate={toDate(fromValue)}
        endDate={toDate(toValue)}
        onChange={handleChange}
        locale="es"
        dateFormat="dd/MM/yyyy"
        minDate={min ? (toDate(min) ?? undefined) : undefined}
        maxDate={max ? (toDate(max) ?? undefined) : undefined}
        disabled={disabled}
        popperClassName="custom-datepicker-popper"
        calendarClassName="custom-datepicker"
        showPopperArrow={true}
        monthsShown={2}
        showMonthDropdown
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={10}
        dropdownMode="select"
        customInput={
          <CustomInput
            value={displayValue}
            placeholder={placeholder}
            hasValue={hasAny}
            onClear={(e) => {
              e.stopPropagation();
              onFromChange("");
              onToChange("");
            }}
          />
        }
      />
    </div>
  );
}
