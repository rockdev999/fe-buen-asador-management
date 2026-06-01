import { FolderTree, ListOrdered } from "lucide-react";
import { formatLocalDate } from "@/lib/formatters";
import { Modifier } from "../../models/modifier.model";
import { formatMoney } from "@/lib/utils";

interface ModifierCardProps {
  modifier: Modifier;
  onEdit: (modifier: Modifier) => void;
}

export function ModifierCard({ modifier, onEdit }: ModifierCardProps) {
  return (
    <div
      className="group rounded-2xl border border-surface bg-white p-4 shadow-sm transition-all hover:border-brand/30 hover:shadow-md"
      onClick={() => onEdit(modifier)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <FolderTree size={16} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-semibold text-inkblack">
              {modifier.name}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ListOrdered size={12} />
              <span>Precio: {formatMoney(modifier.extraPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center mt-2 rounded-xl bg-surface/40 px-3 py-2">
        <p className="pe-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
          Última actualización:{" "}
        </p>

        <p className="text-[11px] font-medium text-inkblack">
          {modifier.audit && modifier.audit?.updatedAt
            ? formatLocalDate(modifier.audit.updatedAt)
            : "--"}
        </p>
      </div>
    </div>
  );
}
