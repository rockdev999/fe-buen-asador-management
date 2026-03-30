import { forwardRef, InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { AppLabel } from "../Basics/AppLabel";
import { Input } from "@/components/ui/input";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, required, className, id, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <AppLabel
            htmlFor={id}
            required={required}
            className="text-xs font-medium text-dark"
          >
            {label}
          </AppLabel>
        )}

        <div className="relative">
          <Input
            id={id}
            ref={ref}
            type={show ? "text" : "password"}
            className={cn(
              "bg-surface border-surface focus-visible:border-brand focus-visible:ring-0 focus-visible:bg-white transition-colors pr-10",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={() => setShow(true)}
            onMouseUp={() => setShow(false)}
            onTouchStart={() => setShow(true)}
            onTouchEnd={() => setShow(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-dark transition-colors"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";
