"use client";

import { useState, useTransition } from "react";
import { getProducts } from "@/lib/api";
import type { ProductListItem } from "@/lib/types";
import ProductGrid from "@/components/product/ProductGrid";

type Props = {
  initialProducts: ProductListItem[];
  initialHasNextPage: boolean;
  categoryId: string;
  filter?: string;
};

export default function LoadMoreProducts({ initialProducts, initialHasNextPage, categoryId, filter }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const next = page + 1;
      const res = await getProducts({ categoryId, filter, page: next, size: 20 });
      setProducts((prev) => [...prev, ...res.products]);
      setPage(next);
      setHasNextPage(res.hasNextPage);
    });
  }

  return (
    <>
      <ProductGrid products={products} />
      {hasNextPage && (
        <div className="flex justify-center mt-16">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="text-[15px] border border-ink px-9 py-3.5 hover:bg-ink hover:text-paper transition-colors duration-200 disabled:opacity-50"
          >
            {isPending ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
