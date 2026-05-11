import { Label as UILabel } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

interface LabelProps extends ComponentPropsWithoutRef<typeof UILabel> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className, children, ...props }, ref) => {
    return (
      <UILabel
        ref={ref}
        className={cn("text-xs font-medium", className)}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </UILabel>
    );
  },
);
