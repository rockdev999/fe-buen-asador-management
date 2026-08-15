import { ColumnDef } from "@/components/shared/DataTable/types";
import { IngredientListItem } from "../../models/ingredient.model";
import { Wheat } from "lucide-react";
import { formatLocalDate } from "@/lib/formatters";
import { INGREDIENT_UNIT_LABELS } from "../../config/ingredient.table";

export const INGREDIENT_COLUMNS: ColumnDef<IngredientListItem>[] = [
  {
    key: "name",
    label: "Insumo",
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
          <Wheat size={13} className="text-muted-foreground/40" />
        </div>
        <p className="text-[13px] font-medium text-inkblack truncate">
          {row.name}
        </p>
      </div>
    ),
  },
  {
    key: "unitOfMeasure",
    label: "Unidad",
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted-foreground border border-surface/80">
        {INGREDIENT_UNIT_LABELS[row.unitOfMeasure]}
      </span>
    ),
  },
  {
    key: "description",
    label: "Descripción",
    render: (row) => (
      <span className="text-[12px] text-muted-foreground line-clamp-1 max-w-[280px]">
        {row.description ?? <span className="opacity-40">—</span>}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Creado",
    render: (row) => (
      <span className="text-[12px] text-muted-foreground">
        {formatLocalDate(row.createdAt)}
      </span>
    ),
  },
];
