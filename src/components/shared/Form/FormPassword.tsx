import { ComponentProps } from "react";
import { FormField } from "../Basics/FormField";
import { Label } from "../Basics/Label";
import { cn } from "@/lib/utils";
import { PasswordField } from "../Interactives/PasswordField";
import { ErrorMessage } from "../Basics/ErrorMessage";

interface FormPasswordProps extends ComponentProps<typeof PasswordField> {
  label: string;
  name: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const FormPassword = ({
  id,
  name,
  label,
  error,
  touched,
  required,
  fieldClassName,
  labelClassName,
  inputClassName,
  className,
  ...props
}: FormPasswordProps) => {
  const fieldId = id ?? name;
  const hasError = touched && error;

  return (
    <FormField className={fieldClassName}>
      <Label htmlFor={fieldId} required={required} className={labelClassName}>
        {label}
      </Label>

      <PasswordField
        id={fieldId}
        name={name}
        className={cn(
          hasError && "border-destructive",
          inputClassName,
          className,
        )}
        {...props}
      />

      <ErrorMessage touched={touched} error={error} />
    </FormField>
  );
};
