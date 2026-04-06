import { Image } from "@/components/shared/Basics/Image";
import { Product } from "@/features/products/models/product.model";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
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
        "flex flex-col items-center gap-1.5 p-2.5 bg-white border border-surface rounded-xl text-center transition-all",
        product.available
          ? "hover:border-brand hover:bg-orange-50 active:scale-95 cursor-pointer"
          : "opacity-40 cursor-not-allowed",
      )}
    >
      <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} />
        ) : (
          <span className="text-brand text-xs font-medium">
            {product.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium text-inkblack leading-tight line-clamp-2 w-full">
        {product.name}
      </span>
      {product.brand && (
        <span className="text-[10px] font-medium text-inkblack leading-tight line-clamp-2 w-full">
          {product.brand}
        </span>
      )}
      <span className="text-[10px] text-brand font-medium">
        {formatMoney(product.price)}
      </span>
    </button>
  );
}
