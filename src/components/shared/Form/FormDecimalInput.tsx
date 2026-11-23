import { FormField } from "../Basics/FormField";
import { Label } from "../Basics/Label";
import { ErrorMessage } from "../Basics/ErrorMessage";
import { cn } from "@/lib/utils";
import { DecimalInput, DecimalInputProps } from "../Interactives/DecimalInput";

interface FormDecimalInputProps extends DecimalInputProps {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
}

/** Igual que `FormInput`, pero para cantidades numéricas (usa `DecimalInput`). */
export function FormDecimalInput({
  id,
  name,
  label,
  error,
  touched,
  helperText,
  required,
  fieldClassName,
  labelClassName,
  className,
  ...props
}: FormDecimalInputProps) {
  const fieldId = id ?? name;
  const hasError = Boolean(touched && error);

  return (
    <FormField className={fieldClassName}>
      <Label htmlFor={fieldId} required={required} className={labelClassName}>
        {label}
      </Label>

      <DecimalInput
        id={fieldId}
        name={name}
        className={cn(
          hasError && "border-destructive focus-visible:ring-destructive/20",
          className,
        )}
        {...props}
      />

      {hasError && <ErrorMessage touched={touched} error={error} />}

      {!hasError && helperText && (
        <p className="text-[10px] text-muted-foreground">{helperText}</p>
      )}
    </FormField>
  );
}
