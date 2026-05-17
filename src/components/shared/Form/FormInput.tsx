import { LucideIcon } from "lucide-react";
import { FormField } from "../Basics/FormField";
import { Label } from "../Basics/Label";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "../Basics/ErrorMessage";

interface FormInputProps extends ComponentProps<typeof Input> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  important?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
}

export function FormInput({
  id,
  name,
  label,
  icon: Icon,
  error,
  touched,
  helperText,
  required,
  important,
  fieldClassName,
  labelClassName,
  className,
  ...props
}: FormInputProps) {
  const fieldId = id ?? name;
  const hasError = Boolean(touched && error);

  return (
    <FormField className={fieldClassName}>
      <Label
        htmlFor={fieldId}
        required={required}
        important={important}
        className={labelClassName}
      >
        {label}
      </Label>

      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          />
        )}

        <Input
          id={fieldId}
          name={name}
          className={cn(
            Icon && "pl-9",
            hasError && "border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          {...props}
        />
      </div>

      {hasError && <ErrorMessage touched={touched} error={error} />}

      {!hasError && helperText && (
        <p className="text-[10px] text-muted-foreground">{helperText}</p>
      )}
    </FormField>
  );
}
