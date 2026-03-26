import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

interface AppLabelProps extends ComponentPropsWithoutRef<typeof Label> {
  required?: boolean;
}

export const AppLabel = forwardRef<HTMLLabelElement, AppLabelProps>(
  ({ required, className, children, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn("text-xs font-medium", className)}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
    );
  },
);
