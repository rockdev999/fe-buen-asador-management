import { EyeOff } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { Category } from "../../models/category.model";

interface CategoryAvailabilityModalProps {
  category: Category;
  /** Nombre de la sucursal del alcance, o null = todas las sucursales. */
  scopeLocationName: string | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Confirmación antes de apagar una categoría: nombra siempre el alcance. */
export const CategoryAvailabilityModal = ({
  category,
  scopeLocationName,
  isPending,
  onConfirm,
  onClose,
}: CategoryAvailabilityModalProps) => {
  const scopeText = scopeLocationName
    ? `en ${scopeLocationName}`
    : "en todas las sucursales";
  const count = category.availableProductsCount;

  return (
    <AppModal size="md" maxHeightClassName="max-h-[85vh]">
      <PanelHeader
        icon={EyeOff}
        title="Desactivar categoría"
        description={category.name}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-inkblack">
          Se desactivarán{" "}
          <span className="font-medium">
            {count} {count === 1 ? "producto" : "productos"}
          </span>{" "}
          de “{category.name}” <span className="font-medium">{scopeText}</span>
          .
        </p>
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          Dejarán de aparecer en el punto de venta {scopeText}. Puedes volver a
          activarlos cuando quieras; no se modifica el stock ni las recetas.
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
          Desactivar
        </Button>
      </PanelFooter>
    </AppModal>
  );
};
