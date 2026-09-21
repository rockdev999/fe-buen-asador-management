import { RoleEnum } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { httpClient } from "@/services/http.client";
import { ApiErrorResponse, ApiMeta, ApiResponse } from "@/types/api.types";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

export type Status = "idle" | "pending" | "success" | "error";

export interface PaginatedData<T> {
  data: T[];
  meta: ApiMeta;
}

function resolveStatus(
  enabled: boolean,
  isActive: boolean,
  isSuccess: boolean,
  isError: boolean,
): Status {
  if (!enabled) return "idle";
  if (isActive) return "pending";
  if (isError) return "error";
  if (isSuccess) return "success";
  return "idle";
}

// ─── Guard por rol ─────────────────────────────────────────────────────────────
// Evita disparar peticiones a endpoints restringidos por rol (evita 403 innecesarios
// y sus toasts de error) sin tener que repetir el check en cada componente.

function useRoleAllowed(roles?: RoleEnum[]): boolean {
  const { hasRole } = useAuth();
  return !roles || roles.length === 0 || hasRole(...roles);
}

// ─── HTTP helpers (fetch puro, sin hooks) ─────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function createFetch<TResponse, TBody = void>(
  method: HttpMethod,
  url: string | ((params: Record<string, string>) => string),
) {
  return (
    body?: TBody,
    urlParams?: Record<string, string>,
    queryParams?: Record<string, unknown>,
  ) => {
    const resolvedUrl =
      typeof url === "function" && urlParams ? url(urlParams) : (url as string);
    return httpClient
      .request<ApiResponse<TResponse>>({
        method,
        url: resolvedUrl,
        data: body,
        params: queryParams,
      })
      .then((r) => r.data.data!);
  };
}

// Shortcuts
export const createGet = <TRes>(
  url: string | ((p: Record<string, string>) => string),
) => createFetch<TRes, void>("GET", url);

export const createPost = <TRes, TBody>(
  url: string | ((p: Record<string, string>) => string),
) => createFetch<TRes, TBody>("POST", url);

export const createPut = <TRes, TBody>(
  url: string | ((p: Record<string, string>) => string),
) => createFetch<TRes, TBody>("PUT", url);

export const createPatch = <TRes, TBody>(
  url: string | ((p: Record<string, string>) => string),
) => createFetch<TRes, TBody>("PATCH", url);

export const createDelete = <TRes>(
  url: string | ((p: Record<string, string>) => string),
) => createFetch<TRes, void>("DELETE", url);

// ─── useGetHandler ────────────────────────────────────────────────────────────

interface UseGetHandlerOptions<TDto, TModel> extends Omit<
  UseQueryOptions<TDto, ApiErrorResponse, TModel>,
  "queryKey" | "queryFn"
> {
  queryKey: QueryKey;
  queryFn: () => Promise<TDto>;
  select?: (data: TDto) => TModel;
  enabled?: boolean;
  staleTime?: number;
  /** Si se define, la petición solo se dispara cuando el usuario tiene alguno de estos roles. */
  roles?: RoleEnum[];
}

export function useGetHandler<TDto, TModel = TDto>({
  queryKey,
  queryFn,
  select,
  enabled = true,
  staleTime = 1000 * 60 * 5,
  roles,
  ...options
}: UseGetHandlerOptions<TDto, TModel>) {
  const isRoleAllowed = useRoleAllowed(roles);
  const finalEnabled = enabled && isRoleAllowed;

  const query = useQuery<TDto, ApiErrorResponse, TModel>({
    queryKey,
    queryFn,
    select,
    enabled: finalEnabled,
    staleTime,
    ...options,
  });

  const isActive = query.isPending || query.isFetching;

  return {
    ...query,
    status: resolveStatus(finalEnabled, isActive, query.isSuccess, query.isError),
    data: query.data ?? null,
    isLoading: isActive && finalEnabled,
  };
}

// ─── usePaginatedGetHandler ───────────────────────────────────────────────────

interface UsePaginatedGetHandlerOptions<TDto, TModel> {
  queryKey: QueryKey;
  queryFn: (params: Record<string, unknown>) => Promise<ApiResponse<TDto[]>>;
  select: (dto: TDto) => TModel;
  params?: Record<string, unknown>;
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean | number;
  /** Si se define, la petición solo se dispara cuando el usuario tiene alguno de estos roles. */
  roles?: RoleEnum[];
}

export function usePaginatedGetHandler<TDto, TModel>({
  queryKey,
  queryFn,
  select,
  params = {},
  enabled = true,
  staleTime = 1000 * 60 * 2,
  retry = false,
  roles,
}: UsePaginatedGetHandlerOptions<TDto, TModel>) {
  const isRoleAllowed = useRoleAllowed(roles);
  const finalEnabled = enabled && isRoleAllowed;

  const query = useQuery<ApiResponse<TDto[]>, ApiErrorResponse>({
    queryKey,
    queryFn: () => queryFn(params),
    enabled: finalEnabled,
    staleTime,
    retry,
  });

  const mapped: PaginatedData<TModel> | null = query.data?.data
    ? {
        data: query.data.data.map(select),
        meta: query.data.meta ?? {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      }
    : null;

  const isActive = query.isPending || query.isFetching;

  return {
    ...query,
    status: resolveStatus(finalEnabled, isActive, query.isSuccess, query.isError),
    data: mapped?.data ?? null,
    meta: mapped?.meta ?? null,
    isLoading: isActive && finalEnabled,
  };
}

// ─── usePostHandler / usePutHandler / usePatchHandler / useDeleteHandler ──────

interface UseSubmitHandlerOptions<TData, TVariables> extends Omit<
  UseMutationOptions<TData, ApiErrorResponse, TVariables>,
  "mutationFn"
> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: string;
  invalidateKeys?: QueryKey[];
  onSuccessCallback?: (data: TData) => void;
  onErrorCallback?: (error: ApiErrorResponse) => void;
}

function useSubmitHandler<TData, TVariables>({
  mutationFn,
  successMessage,
  invalidateKeys,
  onSuccessCallback,
  onErrorCallback,
  ...options
}: UseSubmitHandlerOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, ApiErrorResponse, TVariables>({
    mutationFn,
    onSuccess: (data) => {
      if (successMessage) toast.success(successMessage);
      if (invalidateKeys?.length) {
        invalidateKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
      }
      onSuccessCallback?.(data);
    },
    onError: (error) => {
      // Toast manejado por el interceptor
      onErrorCallback?.(error);
    },
    ...options,
  });

  return {
    ...mutation,
    status: resolveStatus(
      true,
      mutation.isPending,
      mutation.isSuccess,
      mutation.isError,
    ),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}

export const usePostHandler = useSubmitHandler;
export const usePutHandler = useSubmitHandler;
export const usePatchHandler = useSubmitHandler;
export const useDeleteHandler = useSubmitHandler;
