import { forwardRef, InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { Label } from "../Basics/Label";

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

// Convierte string del input a número limpio
// Acepta: "1.500", "1,500", "1500", "15.50", "15,50"
function parseMoneyString(raw: string): number {
  if (!raw || raw.trim() === "") return 0;
  // Eliminar todo excepto números y punto
  const clean = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// Formatea número para mostrar: 1500.5 → "1,500.50"
function formatForDisplay(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Limpia el string dejando solo caracteres válidos para dinero
function sanitizeInput(raw: string, max?: number): string {
  let result = raw.replace(",", ".");
  result = result.replace(/[^0-9.]/g, "");

  // Solo un punto
  const firstDot = result.indexOf(".");
  if (firstDot !== -1) {
    result =
      result.slice(0, firstDot + 1) +
      result.slice(firstDot + 1).replace(/\./g, "");
  }

  // Máximo 2 decimales
  const dotIndex = result.indexOf(".");
  if (dotIndex !== -1 && result.length > dotIndex + 3) {
    result = result.slice(0, dotIndex + 3);
  }

  // Máximo 10 dígitos enteros
  const dotPos = result.indexOf(".");
  const intPart = dotPos === -1 ? result : result.slice(0, dotPos);
  const decPart = dotPos === -1 ? "" : result.slice(dotPos);

  if (intPart.length > 10) {
    result = intPart.slice(0, 10) + decPart;
  }

  // Si hay max, no permitir valor mayor
  if (max !== undefined) {
    const numeric = parseMoneyString(result);
    if (numeric > max) {
      result = formatForDisplay(max);
    }
  }

  return result;
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

    useEffect(() => {
      if (defaultValue !== undefined && !isFocused) {
        setRaw(defaultValue > 0 ? formatForDisplay(defaultValue) : "");
      }
    }, [defaultValue]);

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
