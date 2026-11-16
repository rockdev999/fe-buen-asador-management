import { Banknote, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsappPaymentPreferenceEnum } from "../../dto/whatsapp-order.dto";

export function PaymentChip({ preference }: { preference: WhatsappPaymentPreferenceEnum }) {
  const isQr = preference === WhatsappPaymentPreferenceEnum.QR;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
        isQr ? "bg-purple-50 text-purple-700" : "bg-green-50 text-green-700",
      )}
    >
      {isQr ? <QrCode size={11} /> : <Banknote size={11} />}
      {isQr ? "QR" : "Efectivo"}
    </span>
  );
}
