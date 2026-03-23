import { forwardRef, InputHTMLAttributes } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

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
          <Label htmlFor={id} className="text-xs font-medium text-dark">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
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
