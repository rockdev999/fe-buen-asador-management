import { ApiErrorResponse } from "@/types/api.types";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";

interface UseQueryHandlerOptions<TDto, TModel> extends Omit<
  UseQueryOptions<TDto, ApiErrorResponse, TModel>,
  "queryKey" | "queryFn"
> {
  queryKey: QueryKey;
  queryFn: () => Promise<TDto>;
  select?: (data: TDto) => TModel;
  enabled?: boolean;
  staleTime?: number;
}

export function useQueryHandler<TDto, TModel = TDto>({
  queryKey,
  queryFn,
  select,
  enabled = true,
  staleTime = 1000 * 60 * 5,
  ...options
}: UseQueryHandlerOptions<TDto, TModel>) {
  const query = useQuery<TDto, ApiErrorResponse, TModel>({
    queryKey,
    queryFn,
    select,
    enabled,
    staleTime,
    ...options,
  });

  const status: "idle" | "pending" | "success" | "error" = !enabled
    ? "idle"
    : query.isPending
      ? "pending"
      : query.isSuccess
        ? "success"
        : query.isError
          ? "error"
          : "idle";

  return {
    ...query,
    status,
    data: query.data ?? null,
    isLoading: query.isPending && enabled,
  };
}
