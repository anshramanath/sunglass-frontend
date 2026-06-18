"use server";

import type { ApiResponse, CategoryNode, ProductDetail, ProductListItem, ProductsResponse } from "./types";
import { getSession } from "@/lib/auth";

const BASE = process.env.BASE_URL!;

// ── Public catalog ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function getCategories(brandSlug: string): Promise<CategoryNode[]> {
  return apiFetch("/api/public/categories", { brandSlug });
}

export async function getProducts(params: {
  brandSlug: string;
  categoryId: string;
  filter?: string;
  page?: number;
  size?: number;
}): Promise<ProductsResponse> {
  const query: Record<string, string | number> = {
    brandSlug: params.brandSlug,
    categoryId: params.categoryId,
    page: params.page ?? 1,
    size: params.size ?? 20,
  };
  if (params.filter) query.filter = params.filter;
  return apiFetch("/api/public/products", query);
}

export async function getSaleProducts(params: { brandSlug: string; filter?: string; page?: number; size?: number }): Promise<ProductsResponse> {
  const query: Record<string, string | number> = { brandSlug: params.brandSlug, page: params.page ?? 1, size: params.size ?? 20 };
  if (params.filter) query.filter = params.filter;
  return apiFetch("/api/public/sale", query);
}

export async function getItem(slug: string, brandSlug: string): Promise<ProductDetail> {
  return apiFetch("/api/public/item", { slug, brandSlug });
}

export async function searchProducts(brandSlug: string, q: string): Promise<ProductListItem[]> {
  return apiFetch<{ items: ProductListItem[] }>("/api/public/search", { brandSlug, q }).then((d) => d.items);
}

// ── Authenticated user data ───────────────────────────────────────────────────

async function authedFetch(path: string, options?: RequestInit) {
  const session = await getSession();
  if (!session) return null;
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(options?.headers ?? {}),
    },
  });
}

export async function getCart(brandSlug: string) {
  const res = await authedFetch(`/api/user/cart?brandSlug=${brandSlug}`);
  if (!res?.ok) return null;
  const json = await res.json();
  return json.data.items;
}

export async function putCart(brandSlug: string, items: unknown[]) {
  const res = await authedFetch("/api/user/cart", {
    method: "PUT",
    body: JSON.stringify({ brandSlug, items }),
  });
  return res?.ok ?? false;
}

export async function getBookmarks(brandSlug: string) {
  const res = await authedFetch(`/api/user/bookmarks?brandSlug=${brandSlug}`);
  if (!res?.ok) return null;
  const json = await res.json();
  return json.data.items;
}

export async function putBookmarks(brandSlug: string, items: unknown[]) {
  const res = await authedFetch("/api/user/bookmarks", {
    method: "PUT",
    body: JSON.stringify({ brandSlug, items }),
  });
  return res?.ok ?? false;
}

export async function validateCart(brandSlug: string, items: { sku: string }[]): Promise<Map<string, boolean>> {
  const res = await fetch(`${BASE}/api/public/validate-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandSlug, items }),
  });
  if (!res.ok) return new Map();
  const json = await res.json();
  return new Map((json.data.items as { sku: string; exists: boolean }[]).map((i) => [i.sku, i.exists]));
}

export async function createCheckoutSession(
  brandSlug: string,
  items: { productSlug: string; sku: string; name: string; imageSrc: string; priceCents: number; quantity: number; attribute: { name: string; option: string }[] }[],
  successUrl: string,
  cancelUrl: string,
): Promise<string | null> {
  const res = await authedFetch("/api/user/checkout", {
    method: "POST",
    body: JSON.stringify({ brandSlug, items, successUrl, cancelUrl }),
  });
  if (!res?.ok) return null;
  const json = await res.json();
  return json.data.url ?? null;
}
