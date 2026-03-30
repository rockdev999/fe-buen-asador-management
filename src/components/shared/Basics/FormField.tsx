import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function FormField({ className, children, ...props }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}
