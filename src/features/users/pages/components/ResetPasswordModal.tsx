import { KeyRound } from "lucide-react";
import { AppModal } from "@/components/shared/Overlay/AppModal";
import { PanelHeader } from "@/components/shared/Overlay/PanelHeader";
import { PanelFooter } from "@/components/shared/Overlay/PanelFooter";
import { Button } from "@/components/shared/Basics/Button";
import { UserPageItem } from "../../models/user.model";

interface ResetPasswordModalProps {
  user: UserPageItem;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ResetPasswordModal = ({
  user,
  isPending,
  onConfirm,
  onClose,
}: ResetPasswordModalProps) => (
  <AppModal size="md" maxHeightClassName="max-h-[85vh]">
    <PanelHeader
      icon={KeyRound}
      title="Restablecer contraseña"
      description={user.name}
      onClose={onClose}
    />

    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
      <p className="text-[13px] leading-relaxed text-inkblack">
        Se generará una contraseña temporal y se enviará a{" "}
        <span className="font-medium">{user.email}</span>.
      </p>
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
        {user.name} perderá su sesión actual y deberá cambiar la contraseña al
        ingresar.
      </p>
    </div>

    <PanelFooter align="right">
      <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
        Cancelar
      </Button>
      <Button type="button" onClick={onConfirm} isLoading={isPending}>
        Restablecer
      </Button>
    </PanelFooter>
  </AppModal>
);
