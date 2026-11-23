import { ChangeEvent, ComponentProps, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_MAX_DECIMALS,
  normalizeNumericText,
  numericTextToNumber,
} from "./numeric-input.utils";

const toText = (value: number) => (value ? String(value) : "");

export interface DecimalInputProps extends Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "type"
> {
  value: number;
  onValueChange: (value: number) => void;
  /** Máximo de decimales permitidos (por defecto 2). `0` = solo enteros. */
  maxDecimals?: number;
}

/**
 * Input numérico con decimales limitados (2 por defecto, p. ej. `0.25`).
 *
 * Guarda el texto tal cual lo escribe el usuario para no perder estados
 * intermedios como `0` o `0.` al convertirlo a número en cada tecla.
 * Acepta coma o punto como separador decimal y no permite ceros sobrantes
 * a la izquierda (`00000000.36` queda como `0.36`).
 */
export const DecimalInput = ({
  value,
  onValueChange,
  maxDecimals = DEFAULT_MAX_DECIMALS,
  ...props
}: DecimalInputProps) => {
  const [text, setText] = useState(() => toText(value));

  // Sincroniza cuando el valor cambia desde fuera (reset, recarga de datos…).
  // Se hace durante el render (sin efecto), igual que en MoneyInput.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (numericTextToNumber(text) !== value) setText(toText(value));
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeNumericText(event.target.value, maxDecimals);
    if (normalized === null) return;
    setText(normalized);
    onValueChange(numericTextToNumber(normalized));
  };

  return (
    <Input
      type="text"
      inputMode={maxDecimals > 0 ? "decimal" : "numeric"}
      autoComplete="off"
      value={text}
      onChange={handleChange}
      {...props}
    />
  );
};
