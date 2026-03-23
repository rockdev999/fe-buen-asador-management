import { ApiErrorResponse } from "@/types/api.types";
import { useEffect } from "react";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function useFieldErrors<T extends FieldValues>(
  error: ApiErrorResponse | null,
  setError: UseFormSetError<T>,
) {
  useEffect(() => {
    if (!error?.errors?.length) return;
    error.errors.forEach(({ field, message }) => {
      setError(field as Path<T>, { type: "server", message });
    });
  }, [error]);
}
