import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "outline"
    | "link"
    | "dashed";
  size?: "xs" | "sm" | "md" | "lg" | "icon-xs" | "icon-sm" | "icon-md";
  shape?: "default" | "pill" | "circle";
}

const VARIANT_STYLES: Record<NonNullable<AppButtonProps["variant"]>, string> = {
  primary:
    "border border-transparent bg-brand text-white hover:bg-brand-dark shadow-sm",

  secondary:
    "border border-transparent bg-surface text-inkblack hover:bg-surface/80",

  ghost:
    "border border-transparent bg-transparent text-muted-foreground hover:bg-surface/70 hover:text-inkblack",

  danger:
    "border border-transparent bg-red-500 text-white hover:bg-red-600 shadow-sm",

  outline:
    "border border-surface bg-white text-muted-foreground hover:border-brand/40 hover:bg-surface hover:text-brand",

  link: "border border-transparent bg-transparent px-0 text-brand hover:text-brand-dark hover:underline",

  dashed:
    "border-[1.5px] border-dashed border-surface bg-transparent text-muted-foreground hover:border-brand hover:bg-orange-50 hover:text-brand",
};

const SIZE_STYLES: Record<NonNullable<AppButtonProps["size"]>, string> = {
  xs: "h-7 px-3 text-[11px]",
  sm: "h-8 px-3.5 text-[12px]",
  md: "h-9 px-4 text-[13px]",
  lg: "h-10 px-5 text-[14px]",

  "icon-xs": "h-5 w-5 p-0 text-[10px]",
  "icon-sm": "h-7 w-7 p-0 text-[12px]",
  "icon-md": "h-8 w-8 p-0 text-[13px]",
};

const SHAPE_STYLES: Record<NonNullable<AppButtonProps["shape"]>, string> = {
  default: "rounded-xl",
  pill: "rounded-full",
  circle: "rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      isLoading = false,
      loadingText,
      variant = "primary",
      size = "md",
      shape = "default",
      disabled,
      className,
      children,
      onClick,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        className={cn(
          "inline-flex flex-shrink-0 select-none items-center justify-center gap-1.5 font-medium",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1",
          SIZE_STYLES[size],
          SHAPE_STYLES[shape],
          VARIANT_STYLES[variant],
          !isDisabled && "cursor-pointer active:scale-[0.98]",
          isDisabled && "cursor-not-allowed opacity-55 pointer-events-none",
          className,
        )}
        {...props}
      >
        {isLoading && (
          <span
            className="h-3.5 w-3.5 flex-shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current"
            aria-hidden="true"
          />
        )}

        {isLoading ? (loadingText ?? children) : children}
      </button>
    );
  },
);

Button.displayName = "Button";
