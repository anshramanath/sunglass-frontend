import { ProductListItem } from "@/lib/types";
import ProductCard from "./ProductCard";
import EmptyState from "@/components/shared/EmptyState";

export default function ProductGrid({ products, hideLast = false }: { products: ProductListItem[]; hideLast?: boolean }) {
  if (products.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10">
      {products.map((product, i) => (
        <div key={product.id} className={hideLast && i === products.length - 1 ? "hidden md:block" : undefined}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
