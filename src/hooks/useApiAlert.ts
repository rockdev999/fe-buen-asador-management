import { t } from "@/locales/es";
import { ApiErrorResponse } from "@/types/api.types";
import { useEffect } from "react";
import { toast } from "sonner";

type AlertStatus = "idle" | "pending" | "success" | "error";

interface UseApiAlertOptions {
  status: AlertStatus;
  error?: ApiErrorResponse | null;
  successMessage?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export function useApiAlert({
  status,
  error,
  successMessage,
  onSuccess,
  onError,
}: UseApiAlertOptions) {
  useEffect(() => {
    if (status === "success" && successMessage) {
      toast.success(successMessage);
      onSuccess?.();
    }
  }, [status === "success"]);

  useEffect(() => {
    if (status === "error" && error) {
      const message = error.message ?? t.common.error.generic;
      toast.error(message);
      onError?.();
    }
  }, [status === "error"]);
}
