import { ColumnDef } from "@/components/shared/DataTable/types";
import { LocationPageItem } from "../models/location.model";
import { formatLocalDate } from "@/lib/formatters";
import { CheckCircle, XCircle } from "lucide-react";

export const LOCATION_COLUMNS: ColumnDef<LocationPageItem>[] = [
  {
    key: "name",
    label: "Nombre",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] text-muted-foreground">{row.name}</span>
    ),
  },
  {
    key: "address",
    label: "Dirección",
    sortable: false,
    render: (row) => (
      <span className="text-[11px] text-muted-foreground">{row.address}</span>
    ),
  },
  {
    key: "admins",
    label: "Administradores",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-1 flex-wrap">
        {row.admins && row.admins.length > 0 ? (
          row.admins.map((admin: { id: string; name: string }) => (
            <span key={admin.id} className="text-[11px] text-muted-foreground">
              {admin.name}
            </span>
          ))
        ) : (
          <span className="text-[11px] text-muted-foreground">--</span>
        )}
      </div>
    ),
  },
  {
    key: "active",
    label: "Estado",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-1.5">
        {row.active ? (
          <>
            <CheckCircle size={13} className="text-green-500" />
            <span className="text-[12px] text-green-600">Activo</span>
          </>
        ) : (
          <>
            <XCircle size={13} className="text-red-400" />
            <span className="text-[12px] text-red-500">Inactivo</span>
          </>
        )}
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Creado",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] text-muted-foreground">
        {row.createdAt ? formatLocalDate(row.createdAt) : "--"}
      </span>
    ),
  },
];
