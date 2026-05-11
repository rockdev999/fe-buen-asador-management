import { FilterDropdown } from "@/components/shared/DataTable/TableFilters";

export const ORDER_DROPDOWNS: FilterDropdown[] = [
  {
    key: "status",
    placeholder: "Estado",
    options: [
      { label: "Pendiente", value: "PENDING" },
      { label: "Confirmado", value: "CONFIRMED" },
      { label: "Preparando", value: "PREPARING" },
      { label: "Listo", value: "READY" },
      { label: "Entregado", value: "DELIVERED" },
      { label: "Pagado", value: "PAID" },
      { label: "Cancelado", value: "CANCELLED" },
    ],
  },
  {
    key: "type",
    placeholder: "Tipo",
    options: [
      { label: "Presencial", value: "DINE_IN" },
      { label: "Para llevar", value: "TAKEAWAY" },
      { label: "Delivery", value: "DELIVERY" },
    ],
  },
  {
    key: "channel",
    placeholder: "Canal",
    options: [
      { label: "Tienda", value: "IN_STORE" },
      { label: "WhatsApp", value: "ONLINE" },
    ],
  },
];
