import { Archive } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";

interface ConfirmDeactivateModalProps {
  /** Ej: "Dar de baja producto". */
  title: string;
  /** Nombre del registro que se dará de baja. */
  itemName: string;
  /** Aviso adicional según la entidad (p. ej. productos de una categoría). */
  extraWarning?: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmación de baja lógica: el registro deja de ofrecerse, pero las ventas
 * anteriores lo siguen referenciando sin cambios.
 */
export const ConfirmDeactivateModal = ({
  title,
  itemName,
  extraWarning,
  isPending,
  onConfirm,
  onClose,
}: ConfirmDeactivateModalProps) => (
  <AppModal size="sm" maxHeightClassName="max-h-[85vh]">
    <PanelHeader
      icon={Archive}
      title={title}
      description={itemName}
      onClose={onClose}
    />

    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
      <p className="text-[13px] leading-relaxed text-inkblack">
        ¿Seguro que quieres dar de baja “
        <span className="font-medium">{itemName}</span>”?
      </p>
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
        Dejará de ofrecerse en el menú, el POS y WhatsApp. Las ventas
        anteriores no se modifican.
        {extraWarning && (
          <>
            {" "}
            <span className="font-medium">{extraWarning}</span>
          </>
        )}
      </p>
    </div>

    <PanelFooter align="right">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isPending}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={onConfirm}
        isLoading={isPending}
      >
        Dar de baja
      </Button>
    </PanelFooter>
  </AppModal>
);
