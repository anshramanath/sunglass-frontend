"use server";

import type { ApiResponse, BookmarkedItem, CartItem, CategoryNode, CheckoutResponse, Order, ProductDetail, ProductListItem, ProductsResponse, ValidateCartItem } from "./types";
import { getSession } from "@/lib/auth";

const BASE = process.env.BASE_URL!;

// ── Public catalog ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, params: Record<string, string | number>): Promise<ApiResponse<T>> {
  const url = new URL(`${BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  return res.json();
}

export async function getCategories(brandSlug: string): Promise<ApiResponse<CategoryNode[]>> {
  return apiFetch<CategoryNode[]>("/api/public/categories", { brandSlug });
}

export async function getProducts(params: {
  brandSlug: string;
  categoryId: string;
  filter?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<ProductsResponse>> {
  const query: Record<string, string | number> = {
    brandSlug: params.brandSlug,
    categoryId: params.categoryId,
    page: params.page ?? 1,
    size: params.size ?? 20,
  };
  if (params.filter) query.filter = params.filter;
  return apiFetch<ProductsResponse>("/api/public/products", query);
}

export async function getSaleProducts(params: {
  brandSlug: string;
  filter?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<ProductsResponse>> {
  const query: Record<string, string | number> = {
    brandSlug: params.brandSlug,
    page: params.page ?? 1,
    size: params.size ?? 20,
  };
  if (params.filter) query.filter = params.filter;
  return apiFetch<ProductsResponse>("/api/public/sale", query);
}

export async function getItem(productSlug: string, brandSlug: string): Promise<ApiResponse<ProductDetail>> {
  return apiFetch<ProductDetail>("/api/public/item", { brandSlug, productSlug });
}

export async function searchProducts(brandSlug: string, search: string): Promise<ApiResponse<ProductListItem[]>> {
  return apiFetch<ProductListItem[]>("/api/public/search", { brandSlug, search });
}

export async function validateCart(brandSlug: string, items: { productSlug: string; sku: string; priceCents: number }[]): Promise<ValidateCartItem[]> {
  const res = await fetch(`${BASE}/api/public/validate-cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandSlug, items }),
  });
  return res.json();
}

// ── Authenticated user data ───────────────────────────────────────────────────

async function authedFetch<T>(path: string, method: string, body: unknown): Promise<ApiResponse<T> | null> {
  const session = await getSession();
  if (!session) return null;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getCart(brandSlug: string): Promise<ApiResponse<CartItem[]> | null> {
  return authedFetch<CartItem[]>("/api/user/cart", "POST", { brandSlug });
}

export async function putCart(brandSlug: string, items: CartItem[]): Promise<ApiResponse<{ synced: number }> | null> {
  return authedFetch<{ synced: number }>("/api/user/cart", "PUT", { brandSlug, items });
}

export async function getBookmarks(brandSlug: string): Promise<ApiResponse<BookmarkedItem[]> | null> {
  return authedFetch<BookmarkedItem[]>("/api/user/bookmarks", "POST", { brandSlug });
}

export async function putBookmarks(brandSlug: string, items: BookmarkedItem[]): Promise<ApiResponse<{ synced: number }> | null> {
  return authedFetch<{ synced: number }>("/api/user/bookmarks", "PUT", { brandSlug, items });
}

export async function getOrders(brandSlug: string): Promise<ApiResponse<Order[]> | null> {
  return authedFetch<Order[]>("/api/user/orders", "POST", { brandSlug });
}

export async function createCheckoutSession(
  brandSlug: string,
  items: { productSlug: string; sku: string; priceCents: number; quantity: number }[],
  successUrl: string,
  cancelUrl: string,
): Promise<CheckoutResponse | null> {
  const session = await getSession();
  if (!session) return null;
  const res = await fetch(`${BASE}/api/user/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ brandSlug, items, successUrl, cancelUrl }),
  });
  if (res.ok) {
    const json: ApiResponse<{ url: string }> = await res.json();
    return json.success ? { success: true, url: json.data.url } : { success: false, items: [] };
  }
  return { success: false, items: await res.json() };
}
