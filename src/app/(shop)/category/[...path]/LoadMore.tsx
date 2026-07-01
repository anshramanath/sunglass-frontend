"use client";

import { getProducts } from "@/lib/api";
import type { ProductListItem } from "@/lib/types";
import LoadMoreProducts from "@/components/product/LoadMoreProducts";

type Props = {
  initialProducts: ProductListItem[];
  initialHasNextPage: boolean;
  categoryId: string;
  filter?: string;
};

export default function LoadMore({ initialProducts, initialHasNextPage, categoryId, filter }: Props) {
  return (
    <LoadMoreProducts
      initialProducts={initialProducts}
      initialHasNextPage={initialHasNextPage}
      fetchPage={(page) => getProducts({ categoryId, filter, page, size: 20 })}
    />
  );
}
