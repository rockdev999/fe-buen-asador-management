import { ColumnDef } from "@/components/shared/DataTable/types";
import { Recipe } from "../../models/recipe.model";
import { ChefHat } from "lucide-react";
import { formatLocalDate } from "@/lib/formatters";
import { INGREDIENT_UNIT_LABELS } from "../../config/ingredient.table";

export const RECIPE_COLUMNS: ColumnDef<Recipe>[] = [
  {
    key: "product",
    label: "Producto",
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
          <ChefHat size={13} className="text-muted-foreground/40" />
        </div>
        <p className="text-[13px] font-medium text-inkblack truncate">
          {row.product.name}
        </p>
      </div>
    ),
  },
  {
    key: "ingredient",
    label: "Insumo",
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted-foreground border border-surface/80">
        {row.ingredient.name}
      </span>
    ),
  },
  {
    key: "quantityUsed",
    label: "Cantidad utilizada",
    render: (row) => (
      <span className="text-[13px] font-semibold text-inkblack tabular-nums">
        {row.quantityUsed} {INGREDIENT_UNIT_LABELS[row.ingredient.unitOfMeasure]}
      </span>
    ),
  },
  {
    key: "updatedAt",
    label: "Actualizado",
    render: (row) => (
      <span className="text-[12px] text-muted-foreground">
        {row.audit?.updatedAt
          ? formatLocalDate(row.audit.updatedAt)
          : row.audit?.createdAt
            ? formatLocalDate(row.audit.createdAt)
            : "--"}
      </span>
    ),
  },
];
