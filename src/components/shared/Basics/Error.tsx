import { cn } from "@/lib/utils";

interface ErrorProps {
  touched?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

export function Error({ touched, error, hint, className }: ErrorProps) {
  const show = touched && !!error;
  const message = show ? error : hint;

  return (
    <p
      className={cn(
        "text-xs min-h-[16px] leading-none transition-all",
        show ? "text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      {message ?? ""}
    </p>
  );
}
