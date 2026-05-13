import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const VARIANT_STYLES: Record<NonNullable<AppButtonProps["variant"]>, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-surface text-inkblack hover:bg-surface/80",
  ghost:
    "bg-transparent text-muted-foreground hover:text-inkblack hover:bg-surface/60",
  danger: "bg-red-500 text-white hover:bg-red-600",
  outline:
    "bg-transparent border border-surface text-inkblack hover:border-muted-foreground/30",
};

const SIZE_STYLES: Record<NonNullable<AppButtonProps["size"]>, string> = {
  sm: "h-7 px-3 text-[11px]",
  md: "h-9 px-5 text-[13px]",
  lg: "h-11 px-6 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      isLoading = false,
      variant = "primary",
      size = "md",
      disabled,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-xl",
          "transition-all duration-150 flex-shrink-0 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
          SIZE_STYLES[size],
          VARIANT_STYLES[variant],
          !isDisabled && "active:scale-[0.97] cursor-pointer",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
