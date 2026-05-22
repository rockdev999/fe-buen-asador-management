import { Image } from "@/components/shared/Basics/Image";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CategoryProduct } from "../../../catalog/categories/models/category.model";

interface ProductCardProps {
  product: CategoryProduct;
  onAdd: (product: CategoryProduct) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <button
      type="button"
      disabled={!product.available}
      onClick={() => {
        if (!product.available) return;
        onAdd(product);
      }}
      className={cn(
        "flex h-[220px] w-[200px] flex-col items-center justify-between gap-2 rounded-2xl border border-surface bg-white p-3 text-center transition-all",
        product.available
          ? "cursor-pointer hover:border-brand hover:bg-orange-50 active:scale-95"
          : "cursor-not-allowed opacity-40",
      )}
    >
      <div className="flex h-[115px] w-full items-center justify-center rounded-xl bg-brand/10 p-2">
        {product.imageUrl ? (
          <div className="flex h-full w-full items-center justify-center [&_img]:max-h-full [&_img]:max-w-full [&_img]:object-contain">
            <Image src={product.imageUrl} alt={product.name} />
          </div>
        ) : (
          <span className="text-xl font-semibold text-brand">
            {product.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-1">
        <span className="line-clamp-2 w-full text-sm font-semibold leading-tight text-inkblack">
          {product.name}
        </span>

        {product.brand && (
          <span className="line-clamp-1 w-full text-xs font-medium leading-tight text-muted-foreground">
            {product.brand}
          </span>
        )}
      </div>

      <span className="text-base font-bold text-brand">
        {formatMoney(product.price)}
      </span>
    </button>
  );
}
