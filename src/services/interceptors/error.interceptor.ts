import { API_ERROR_CODES, HTTP_STATUS, MESSAGES } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { ApiErrorResponse } from "@/types/api.types";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

function getErrorMessage(error: AxiosError<ApiErrorResponse>): string {
  const status = error.response?.status;
  const beMessage = error.response?.data?.message;

  if (!error.response) {
    if (axios.isCancel(error)) return MESSAGES.ERROR.CANCELED;
    if (error.code === "ECONNABORTED") return MESSAGES.ERROR.TIMEOUT;
    return MESSAGES.ERROR.OFFLINE;
  }

  if (beMessage) return beMessage;

  switch (status) {
    case HTTP_STATUS.FORBIDDEN:
      return MESSAGES.ERROR.UNAUTHORIZED;
    case HTTP_STATUS.NOT_FOUND:
      return beMessage ?? MESSAGES.ERROR.NOT_FOUND;
    case HTTP_STATUS.CONFLICT:
      return beMessage ?? MESSAGES.ERROR.CONFLICT;
    case HTTP_STATUS.BAD_REQUEST:
      return beMessage ?? MESSAGES.ERROR.BAD_REQUEST;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return beMessage ?? MESSAGES.ERROR.UNPROCESSABLE;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return MESSAGES.ERROR.SERVER_ERROR;
    default:
      return beMessage ?? MESSAGES.ERROR.GENERIC;
  }
}

const PUBLIC_PATHS = ["/login", "/select-location"];

function isPublicPath(): boolean {
  return PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));
}

export function errorInterceptor(error: AxiosError<ApiErrorResponse>) {
  const status = error.response?.status;
  const errorCode = error.response?.data?.errorCode;
  const fields = error.response?.data?.errors ?? [];
  const message = getErrorMessage(error);

  const isUnauthorized =
    status === HTTP_STATUS.UNAUTHORIZED ||
    errorCode === API_ERROR_CODES.UNAUTHORIZED;

  if (isUnauthorized && !isPublicPath()) {
    useAuthStore.getState().logout();
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  const hasFieldErrors = fields.length > 0;

  if (hasFieldErrors) {
    fields.forEach(({ field, message: fieldMessage }) => {
      toast.error(`${field}: ${fieldMessage}`);
    });
  } else {
    const isWarning =
      status === HTTP_STATUS.FORBIDDEN || status === HTTP_STATUS.NOT_FOUND;

    if (isWarning) toast.warning(message);
    else toast.error(message);
  }

  return Promise.reject({
    message,
    fields,
    status,
    errorCode,
  });
}
