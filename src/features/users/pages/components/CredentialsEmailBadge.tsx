import { Loader2, MailCheck, MailWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import { CredentialsEmailStatusEnum } from "@/constants/enums/user.enum";

const CREDENTIALS_EMAIL_BADGE: Record<
  CredentialsEmailStatusEnum,
  { label: string; className: string; icon: typeof MailCheck }
> = {
  [CredentialsEmailStatusEnum.PENDING]: {
    label: "Enviando…",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Loader2,
  },
  [CredentialsEmailStatusEnum.SENT]: {
    label: "Credenciales enviadas",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: MailCheck,
  },
  [CredentialsEmailStatusEnum.FAILED]: {
    label: "Error al enviar",
    className: "bg-red-50 text-red-600 border-red-200",
    icon: MailWarning,
  },
};

/** Estado del correo con la contraseña temporal. */
export const CredentialsEmailBadge = ({
  status,
}: {
  status: CredentialsEmailStatusEnum;
}) => {
  const { label, className, icon: Icon } = CREDENTIALS_EMAIL_BADGE[status];
  return (
    <span
      title="Correo con la contraseña temporal"
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
        className,
      )}
    >
      <Icon
        size={10}
        className={cn(
          status === CredentialsEmailStatusEnum.PENDING && "animate-spin",
        )}
      />
      {label}
    </span>
  );
};
