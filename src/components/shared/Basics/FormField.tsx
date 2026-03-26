import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { AppLabel } from "./AppLabel";
import { Input } from "@/components/ui/input";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, required, hint, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <AppLabel
            htmlFor={id}
            required={required}
            className="text-xs font-medium text-dark"
          ></AppLabel>
        )}

        <Input
          id={id}
          ref={ref}
          className={cn(
            "bg-surface border-surface focus-visible:border-brand focus-visible:ring-0 focus-visible:bg-white transition-colors",
            error &&
              "border-destructive focus-visible:border-destructive bg-white",
            className,
          )}
          {...props}
        />

        {/* Error o hint — siempre ocupa espacio para evitar layout shift */}
        <p
          className={cn(
            "text-xs min-h-[16px] leading-none",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? hint ?? ""}
        </p>
      </div>
    );
  },
);

FormField.displayName = "FormField";
