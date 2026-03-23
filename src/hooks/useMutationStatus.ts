import { t } from "@/locales/es";
import { ApiErrorResponse } from "@/types/api.types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export type Status = "idle" | "pending" | "success" | "error";

interface UseMutationHandlerOptions<TData, TVariables> extends Omit<
  UseMutationOptions<TData, ApiErrorResponse, TVariables>,
  "mutationFn"
> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
  onSuccessCallback?: (data: TData) => void;
  onErrorCallback?: (error: ApiErrorResponse) => void;
}

export function useMutationHandler<TData, TVariables>({
  mutationFn,
  successMessage,
  errorMessage,
  onSuccessCallback,
  onErrorCallback,
  ...options
}: UseMutationHandlerOptions<TData, TVariables>) {
  const mutation = useMutation<TData, ApiErrorResponse, TVariables>({
    mutationFn,
    onSuccess: (data) => {
      if (successMessage) toast.success(successMessage);
      onSuccessCallback?.(data);
    },
    onError: (error) => {
      // Errores de campo (400/422) los maneja el form, no el toast
      const hasFieldErrors = error.errors?.length > 0;
      if (!hasFieldErrors) {
        toast.error(error.message ?? errorMessage ?? t.common.error.generic);
      }
      onErrorCallback?.(error);
    },
    ...options,
  });

  const status: Status = mutation.isPending
    ? "pending"
    : mutation.isSuccess
      ? "success"
      : mutation.isError
        ? "error"
        : "idle";

  return {
    ...mutation,
    status,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}
