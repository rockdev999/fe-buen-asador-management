import { LucideIcon } from "lucide-react";
import { FormField } from "../Basics/FormField";
import { Label } from "../Basics/Label";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ComponentProps } from "react";
import { ErrorMessage } from "../Basics/ErrorMessage";

interface FormTextareaProps extends ComponentProps<typeof Textarea> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  important?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  showCounter?: boolean;
}

export const FormTextarea = ({
  id,
  name,
  label,
  icon: Icon,
  error,
  touched,
  helperText,
  required,
  showCounter,
  maxLength,
  className,
  important,
  fieldClassName,
  labelClassName,
  textareaClassName,
  value,
  ...props
}: FormTextareaProps) => {
  const fieldId = id ?? name;
  const hasError = touched && error;
  const textValue = typeof value === "string" ? value : "";

  return (
    <FormField className={fieldClassName}>
      {label && (
        <Label
          htmlFor={fieldId ?? ""}
          required={required}
          important={important}
          className={labelClassName}
        >
          {label}
        </Label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-3 text-muted-foreground/40"
          />
        )}

        <Textarea
          id={fieldId ?? ""}
          name={name}
          value={value}
          maxLength={maxLength}
          className={cn(
            "w-full resize-none rounded-xl border bg-white py-2 pr-3 text-[13px] text-inkblack placeholder:text-muted-foreground/30",
            "transition-all focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20",
            Icon ? "pl-9" : "pl-3",
            hasError ? "border-red-300" : "border-surface",
            textareaClassName,
            className,
          )}
          {...props}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          <ErrorMessage touched={touched} error={error} />

          {!hasError && helperText && (
            <p className="text-[10px] text-muted-foreground">{helperText}</p>
          )}
        </div>

        {showCounter && maxLength && (
          <span className="text-[10px] text-muted-foreground">
            {textValue.length}/{maxLength}
          </span>
        )}
      </div>
    </FormField>
  );
};
