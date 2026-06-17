import { ProductListItem } from "@/lib/types";
import ProductCard from "./ProductCard";
import EmptyState from "@/components/shared/EmptyState";

export default function ProductGrid({ products, categoryPath }: { products: ProductListItem[]; categoryPath?: string }) {
  if (products.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} categoryPath={categoryPath} />
      ))}
    </div>
  );
}
