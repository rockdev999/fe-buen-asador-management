import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { Label } from "../Basics/Label";
import {
  formatForDisplay,
  parseMoneyString,
  sanitizeInput,
} from "./money-input.utils";

interface MoneyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "defaultValue"
> {
  label?: string;
  error?: string;
  currency?: string;
  required?: boolean;
  max?: number;
  min?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      label,
      currency = "Bs.",
      required,
      className,
      id,
      error,
      onChange,
      onBlur,
      max,
      min,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const [raw, setRaw] = useState<string>(
      defaultValue && defaultValue > 0 ? formatForDisplay(defaultValue) : "",
    );
    const [isFocused, setIsFocused] = useState(false);
    const [isTouched, setIsTouched] = useState(false);

    // Sincroniza el valor externo durante el render (sin efecto) cuando cambia
    // defaultValue y el usuario no está editando.
    const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
    if (defaultValue !== prevDefaultValue) {
      setPrevDefaultValue(defaultValue);
      if (defaultValue !== undefined && !isFocused) {
        setRaw(defaultValue > 0 ? formatForDisplay(defaultValue) : "");
      }
    }

    const numericValue = parseMoneyString(raw);
    const exceedsMax = max !== undefined && numericValue > max;
    const belowMin =
      min !== undefined && numericValue < min && numericValue > 0;
    const hasError = !!error || (isTouched && (exceedsMax || belowMin));

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const sanitized = sanitizeInput(e.target.value, max); // ← pasar max
      setRaw(sanitized);
      const numeric = parseMoneyString(sanitized);
      onChange?.(numeric);
    }

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      setIsFocused(true);
      if (raw) {
        const numeric = parseMoneyString(raw);
        const editableRaw = numeric === 0 ? "" : String(numeric);
        setRaw(editableRaw);
        setTimeout(() => e.target.select(), 0);
      }
      props.onFocus?.(e);
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      setIsFocused(false);
      setIsTouched(true);

      let numeric = parseMoneyString(raw);

      if (min !== undefined && numeric > 0) numeric = Math.max(numeric, min);
      if (max !== undefined) numeric = Math.min(numeric, max);

      const formatted = numeric > 0 ? formatForDisplay(numeric) : "";
      setRaw(formatted);
      onChange?.(numeric);
      onBlur?.(e);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      const controlKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
        "Enter",
        "Home",
        "End",
      ];
      if (controlKeys.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;

      if (!/^[0-9.,]$/.test(e.key)) {
        e.preventDefault();
        return;
      }

      // Prevenir doble punto
      if (e.key === "." && raw.includes(".")) {
        e.preventDefault();
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        const dotPos = raw.indexOf(".");
        const intPart = dotPos === -1 ? raw : raw.slice(0, dotPos);
        const isEditingDecimals =
          dotPos !== -1 &&
          (e.target as HTMLInputElement).selectionStart! > dotPos;

        if (intPart.replace(/[^0-9]/g, "").length >= 10 && !isEditingDecimals) {
          e.preventDefault();
          return;
        }

        if (max !== undefined) {
          const prospective = parseMoneyString(raw + e.key);
          if (prospective > max) {
            e.preventDefault();
            return;
          }
        }
      }
    }

    const autoError =
      isTouched && exceedsMax
        ? `Máximo: ${formatForDisplay(max!)}`
        : isTouched && belowMin
          ? `Mínimo: ${formatForDisplay(min!)}`
          : null;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}

        <div className="relative w-full">
          {currency && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none select-none">
              {currency}
            </span>
          )}
          <Input
            ref={ref}
            id={id}
            type="text"
            inputMode="decimal"
            value={raw}
            placeholder="0.00"
            className={cn(
              "w-full tabular-nums",
              currency ? "pl-9" : "pl-3",
              "text-right font-medium",
              "placeholder:text-muted-foreground/30",
              "focus-visible:ring-0",
              hasError
                ? "border-destructive focus-visible:border-destructive"
                : "focus-visible:border-brand/50",
              className,
            )}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </div>

        {(error || autoError) && (
          <p className="text-[10px] text-destructive leading-tight">
            {error ?? autoError}
          </p>
        )}
      </div>
    );
  },
);
