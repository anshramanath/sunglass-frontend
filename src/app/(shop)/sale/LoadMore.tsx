"use client";

import { getSaleProducts } from "@/lib/api";
import type { ProductListItem } from "@/lib/types";
import LoadMoreProducts from "@/components/product/LoadMoreProducts";

type Props = {
  initialProducts: ProductListItem[];
  initialHasNextPage: boolean;
  filter?: string;
};

export default function LoadMore({ initialProducts, initialHasNextPage, filter }: Props) {
  return (
    <LoadMoreProducts
      initialProducts={initialProducts}
      initialHasNextPage={initialHasNextPage}
      fetchPage={(page) => getSaleProducts({ filter, page, size: 20 })}
    />
  );
}
