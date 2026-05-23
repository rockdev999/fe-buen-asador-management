// src/components/shared/Form/FormSwitchField.tsx

import { cn } from "@/lib/utils";

interface FormSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function FormSwitch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: FormSwitchProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border border-surface bg-surface/20 px-3 py-2.5 text-left transition-all",
        "hover:border-brand/30 hover:bg-orange-50/40",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div>
        <p className="text-[12px] font-medium text-inkblack">{label}</p>

        {description && (
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-muted-foreground/25",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
