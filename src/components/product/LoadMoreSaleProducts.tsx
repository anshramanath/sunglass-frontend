"use client";

import { useState, useTransition } from "react";
import { getSaleProducts } from "@/lib/api";
import { BRAND_SLUG } from "@/lib/brand";
import type { ProductListItem } from "@/lib/types";
import ProductGrid from "./ProductGrid";

type Props = {
  initialProducts: ProductListItem[];
  initialHasNextPage: boolean;
  filter?: string;
};

export default function LoadMoreSaleProducts({ initialProducts, initialHasNextPage, filter }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const next = page + 1;
      const res = await getSaleProducts({ brandSlug: BRAND_SLUG, filter, page: next, size: 20 });
      if (!res.success) return;
      setProducts((prev) => [...prev, ...res.data.products]);
      setPage(next);
      setHasNextPage(res.data.hasNextPage);
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
