import { ColumnDef } from "@/components/shared/DataTable/types";
import { UserPageItem } from "../../models/user.model";
import { ROLE_COLORS, ROLE_LABELS } from "@/utils/generalStatus/role-display";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import { formatLocalDate } from "@/lib/formatters";
import { JOB_POSITION_LABELS } from "@/utils/generalStatus/job-display";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

export const USER_COLUMNS: ColumnDef<UserPageItem>[] = [
  {
    key: "name",
    label: "Nombre",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] text-muted-foreground">{row.name}</span>
    ),
  },
  {
    key: "username",
    label: "Usuario",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] text-muted-foreground">{row.username}</span>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] text-muted-foreground">{row.email}</span>
    ),
  },
  {
    key: "phone",
    label: "Teléfono",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] text-muted-foreground">
        {row.phone ?? "--"}
      </span>
    ),
  },
  {
    key: "position",
    label: "Cargo",
    sortable: true,
    render: (row) => {
      if (!row.positions?.length) {
        return <span className="text-[11px] text-muted-foreground/40">—</span>;
      }
      const MAX = 2;
      const visible = row.positions.slice(0, MAX);
      const remaining = row.positions.length - MAX;
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {visible.map((pos: JobPositionEnum) => (
            <span
              key={pos}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted-foreground border border-surface/80"
            >
              {JOB_POSITION_LABELS[pos] ?? pos}
            </span>
          ))}
          {remaining > 0 && (
            <span className="text-[10px] text-muted-foreground/50">
              +{remaining}
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "locations",
    label: "Sucursales",
    render: (row) => {
      if (!row.locations?.length) {
        return <span className="text-[11px] text-muted-foreground/40">--</span>;
      }

      const MAX_VISIBLE = 1;
      const visible = row.locations.slice(0, MAX_VISIBLE);
      const remaining = row.locations.length - MAX_VISIBLE;

      return (
        <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
          {visible.map((loc) => (
            <span
              key={loc.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-inkblack border border-surface/80 whitespace-nowrap"
              title={
                loc.role
                  ? `${loc.name} — ${ROLE_LABELS[loc.role.name] ?? loc.role.name}`
                  : loc.name
              }
            >
              {loc.name}
              {loc.role && (
                <span
                  className={cn(
                    "px-1 py-0.5 rounded text-[9px] font-semibold",
                    ROLE_COLORS[loc.role.name] ?? "text-muted-foreground",
                  )}
                >
                  {ROLE_LABELS[loc.role.name] ?? loc.role.name}
                </span>
              )}
            </span>
          ))}
          {remaining > 0 && (
            <span
              className="text-[10px] text-muted-foreground/60 whitespace-nowrap"
              title={row.locations
                .slice(MAX_VISIBLE)
                .map((l) => l.name)
                .join(", ")}
            >
              +{remaining} más
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "active",
    label: "Estado",
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
        {formatLocalDate(row.createdAt)}
      </span>
    ),
  },
];
