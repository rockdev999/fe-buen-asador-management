import { useEffect } from "react";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

interface FieldError {
  field: string;
  message: string;
}

export function useFieldErrors<T extends FieldValues>(
  errors: FieldError[] | undefined,
  setError: UseFormSetError<T>,
) {
  useEffect(() => {
    if (!errors?.length) return;
    errors.forEach(({ field, message }) => {
      setError(field as Path<T>, { type: "server", message });
    });
  }, [errors, setError]);
}
