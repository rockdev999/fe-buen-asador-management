import { useState } from "react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";

const REASON_MAX = 500;

interface CancelOrderModalProps {
  shortId: string;
  /** PENDING = "Rechazar"; en otros estados = "Cancelar". */
  isReject: boolean;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Pide el motivo (obligatorio, máx. 500): el cliente lo recibe por WhatsApp. */
export function CancelOrderModal({
  shortId,
  isReject,
  isLoading,
  onConfirm,
  onClose,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const verb = isReject ? "Rechazar" : "Cancelar";

  return (
    <AppModal size="sm" onClose={onClose}>
      <PanelHeader
        title={`${verb} pedido #${shortId}`}
        description="El cliente recibirá este motivo por WhatsApp."
        icon={XCircle}
        onClose={isLoading ? undefined : onClose}
      />
      <form
        className="flex flex-col gap-3 px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed && !isLoading) onConfirm(trimmed);
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Motivo <span className="text-destructive">*</span>
          </span>
          <Textarea
            autoFocus
            rows={3}
            value={reason}
            maxLength={REASON_MAX}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Nos quedamos sin lechón"
            className="text-sm"
          />
          <span className="self-end text-[10px] text-muted-foreground tabular-nums">
            {reason.length}/{REASON_MAX}
          </span>
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9"
          >
            Volver
          </Button>
          <Button
            type="submit"
            disabled={!trimmed || isLoading}
            loading={isLoading}
            className="h-9 flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {verb} pedido
          </Button>
        </div>
      </form>
    </AppModal>
  );
}
