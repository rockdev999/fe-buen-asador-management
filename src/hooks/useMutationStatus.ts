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
