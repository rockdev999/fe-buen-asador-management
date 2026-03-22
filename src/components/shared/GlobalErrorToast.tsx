import { useErrorStore } from "@/stores/error.store";
import { useEffect } from "react";
import { toast } from "sonner";

export function GlobalErrorToast() {
  const { error, clear } = useErrorStore();

  useEffect(() => {
    if (!error) return;

    const options = {
      description: error.message,
      duration: 5000,
      onDismiss: clear,
      onAutoClose: clear,
    };

    switch (error.type) {
      case "error":
        toast.error("Error", options);
        break;
      case "warning":
        toast.warning("Warning", options);
        break;
      case "info":
        toast.info("Info", options);
        break;
    }

    clear();
  }, [error, clear]);

  return null;
}
