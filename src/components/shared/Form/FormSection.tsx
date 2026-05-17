import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  rightContent?: ReactNode;
}

export const FormSection = ({
  title,
  description,
  icon: Icon,
  children,
  className,
  rightContent,
}: FormSectionProps) => {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {Icon && <Icon size={11} />}
            {title}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              {description}
            </p>
          )}
        </div>

        {rightContent}
      </div>

      {children}
    </section>
  );
};
