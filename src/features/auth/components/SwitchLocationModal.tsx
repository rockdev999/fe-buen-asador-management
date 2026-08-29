import { useState } from "react";
import { Building2, AlertTriangle } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { cn } from "@/lib/utils";
import { t } from "@/locales/es";
import { RoleEnum } from "@/constants";
import { useAuth } from "../hooks/useAuth";
import { useMyLocations } from "../hooks/useMyLocations";
import { useSelectLocation } from "../hooks/useSelectLocation";
import { useActiveShift } from "@/features/pos/hooks/useShift";

const trans = t.auth.switchLocation;

interface SwitchLocationModalProps {
  onClose: () => void;
}

export function SwitchLocationModal({ onClose }: SwitchLocationModalProps) {
  const { user } = useAuth();
  const isCashier = user?.role === RoleEnum.CASHIER;

  const { data: locations, status: locationsStatus } = useMyLocations();
  const { isOpen: hasOpenShift, status: shiftStatus } = useActiveShift(isCashier);

  const { mutate: switchLocation, status: switchStatus } = useSelectLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isBlockedByShift = isCashier && hasOpenShift;
  const isLoading =
    locationsStatus === "pending" || (isCashier && shiftStatus === "pending");

  const selectableLocations = (locations ?? []).filter(
    (location) => location.id !== user?.locationId,
  );

  function handleConfirm() {
    if (!selectedId || isBlockedByShift) return;
    switchLocation(selectedId, { onSuccess: onClose });
  }

  return (
    <AppModal size="sm" maxHeightClassName="max-h-[80vh]">
      <PanelHeader icon={Building2} title={trans.title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-4 text-xs text-muted-foreground">{trans.subtitle}</p>

        {isBlockedByShift ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-[12px] font-semibold text-amber-800">
                {trans.shiftOpenTitle}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                {trans.shiftOpenDescription}
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {trans.loading}
          </p>
        ) : selectableLocations.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {trans.empty}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectableLocations.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => setSelectedId(location.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-[1.5px] p-3 text-left transition-all",
                  selectedId === location.id
                    ? "border-brand bg-white"
                    : "border-surface bg-surface hover:border-brand-light hover:bg-white",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                  <Building2 size={14} className="text-brand" />
                </div>
                <span className="truncate text-sm font-medium text-inkblack">
                  {location.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <PanelFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {trans.cancel}
        </Button>
        <Button
          type="button"
          isLoading={switchStatus === "pending"}
          loadingText={trans.confirming}
          disabled={!selectedId || isBlockedByShift}
          onClick={handleConfirm}
        >
          {trans.confirm}
        </Button>
      </PanelFooter>
    </AppModal>
  );
}
