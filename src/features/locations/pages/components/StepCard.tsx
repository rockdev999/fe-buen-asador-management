import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepCardProps {
  active: boolean;
  done: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const StepCard = ({
  active,
  done,
  icon,
  title,
  description,
  onClick,
  disabled,
}: StepCardProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2 transition-all",
        active
          ? "border-brand/40 bg-brand/10"
          : done
            ? "border-green-100 bg-green-50"
            : "border-surface bg-surface/20",
        onClick ? "cursor-pointer" : "cursor-default",
        disabled && "pointer-events-none opacity-50",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          active
            ? "bg-brand text-white"
            : done
              ? "bg-green-100 text-green-600"
              : "bg-white text-muted-foreground",
        )}
      >
        {done ? <Check size={14} /> : icon}
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-[12px] font-semibold",
            active ? "text-brand-dark" : "text-inkblack",
          )}
        >
          {title}
        </p>

        <p className="truncate text-[10px] text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};
