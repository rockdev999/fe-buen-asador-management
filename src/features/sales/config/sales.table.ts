import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";
import { PaymentMethodEnum, SaleStatusEnum } from "@/constants";

export const SALES_DROPDOWNS: FilterDropdown[] = [
  {
    key: "status",
    placeholder: "Estado",
    options: [
      { label: "Cobrada", value: SaleStatusEnum.CLOSED },
      { label: "Anulada", value: SaleStatusEnum.ANNULLED },
      { label: "Abierta", value: SaleStatusEnum.OPEN },
    ],
  },
  {
    key: "paymentMethod",
    placeholder: "Método de pago",
    options: [
      { label: "Efectivo", value: PaymentMethodEnum.CASH },
      { label: "Tarjeta", value: PaymentMethodEnum.BANK_TRANSFER },
      { label: "QR", value: PaymentMethodEnum.QR },
    ],
  },
];
