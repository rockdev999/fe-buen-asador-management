import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { formatMoneyDisplay, formatMoneyInput, parseMoney } from "@/lib/money";
import { AppLabel } from "../Basics/AppLabel";

interface MoneyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
> {
  label?: string;
  error?: string;
  currency?: string;
  required?: boolean;
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
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState<string>(
      props.defaultValue ? formatMoneyDisplay(Number(props.defaultValue)) : "",
    );

    const [numericValue, setNumericValue] = useState<number>(
      props.defaultValue ? Number(props.defaultValue) : 0,
    );

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = formatMoneyInput(e.target.value);
      const numeric = parseMoney(raw);
      setDisplayValue(raw);
      setNumericValue(numeric);
      e.target.value = raw;
      onChange?.(numeric);
    }

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      const raw = numericValue === 0 ? "" : String(numericValue);
      setDisplayValue(raw);
      e.target.value = raw;
      props.onFocus?.(e);
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      const formatted =
        numericValue === 0 ? "" : formatMoneyDisplay(numericValue);
      setDisplayValue(formatted);
      e.target.value = formatted;
      onChange?.(numericValue);
      onBlur?.(e);
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <AppLabel htmlFor={id} required={required}>
            {label}
          </AppLabel>
        )}

        <div className="relative w-full">
          {currency && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none select-none">
              {currency}
            </span>
          )}
          <Input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={displayValue}
            className={cn(
              "w-full",
              currency ? "pl-9" : "pl-3",
              "text-right font-medium",
              "bg-background border-input",
              "focus-visible:border-ring focus-visible:ring-0",
              "transition-colors",
              className,
            )}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </div>
      </div>
    );
  },
);
