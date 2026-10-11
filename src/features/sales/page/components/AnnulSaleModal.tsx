import { useState } from "react";
import { Ban } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { FormTextarea } from "@/components/shared/Form/FormTextarea";
import { Button } from "@/components/shared/Basics/Button";
import { formatMoney } from "@/lib/utils";
import { useAnnulSale } from "../../hooks/useSale";
import { Sale } from "../../models/sale";

const REASON_MAX_LENGTH = 500;

interface AnnulSaleModalProps {
  sale: Sale;
  onClose: () => void;
  onSuccess: () => void;
}

export const AnnulSaleModal = ({
  sale,
  onClose,
  onSuccess,
}: AnnulSaleModalProps) => {
  const { mutate: annulSale, status: annulStatus } = useAnnulSale();

  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const error = reason.trim() ? undefined : "Ingresa el motivo de anulación";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (error) return;
    annulSale({ id: sale.id, reason: reason.trim() }, { onSuccess });
  }

  return (
    <AppModal
      size="md"
      maxHeightClassName="max-h-[85vh]"
      overlayClassName="z-[60]"
    >
      <PanelHeader
        icon={Ban}
        title="Anular venta"
        description={`Ticket ${sale.ticketCode} · ${formatMoney(sale.total)}`}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3">
          <p className="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700">
            Se devolverá el stock de productos e insumos y el pedido quedará
            cancelado. Esta acción no se puede deshacer.
          </p>

          <FormTextarea
            required
            id="reason"
            name="reason"
            label="Motivo"
            placeholder="Ej: Cliente canceló el pedido"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            touched={touched}
            error={error}
            maxLength={REASON_MAX_LENGTH}
            showCounter
            rows={3}
          />
        </div>

        <PanelFooter>
          <div />
          <div>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={annulStatus === "pending"}
            >
              Anular venta
            </Button>
          </div>
        </PanelFooter>
      </form>
    </AppModal>
  );
};
