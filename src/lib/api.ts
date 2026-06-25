"use server";

import type { ApiResponse, BookmarkedItem, CartItem, CategoryNode, CheckoutResponse, Order, ProductDetail, ProductListItem, ProductsResponse, ValidateCartItem } from "./types";
import { getSession } from "@/lib/auth";

const BASE = process.env.BASE_URL!;

// ── Public catalog ────────────────────────────────────────────────────────────

async function apiFetch(path: string, params: Record<string, string | number>): Promise<Response> {
  try {
    const url = new URL(`${BASE}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    return fetch(url.toString(), { next: { revalidate: 60 } });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Network error" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

export async function getCategories(brandSlug: string): Promise<ApiResponse<CategoryNode[]>> {
  const res = await apiFetch("/api/public/categories", { brandSlug });
  return res.json();
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
  const res = await apiFetch("/api/public/products", query);
  return res.json();
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
  const res = await apiFetch("/api/public/sale", query);
  return res.json();
}

export async function getItem(productSlug: string, brandSlug: string): Promise<ApiResponse<ProductDetail>> {
  const res = await apiFetch("/api/public/item", { brandSlug, productSlug });
  return res.json();
}

export async function searchProducts(brandSlug: string, search: string): Promise<ApiResponse<ProductListItem[]>> {
  const res = await apiFetch("/api/public/search", { brandSlug, search });
  return res.json();
}

export async function validateCart(brandSlug: string, items: { productSlug: string; sku: string; priceCents: number }[]): Promise<ValidateCartItem[]> {
  try {
    const res = await fetch(`${BASE}/api/public/validate-cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandSlug, items }),
    });
    return res.json();
  } catch {
    return [];
  }
}

// ── Authenticated user data ───────────────────────────────────────────────────

async function authedFetch(path: string, method: string, body: unknown): Promise<Response> {
  const session = await getSession();
  if (!session) return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  try {
    return fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Network error" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

export async function getCart(brandSlug: string): Promise<ApiResponse<CartItem[]>> {
  const res = await authedFetch("/api/user/cart", "POST", { brandSlug });
  return res.json();
}

export async function putCart(brandSlug: string, items: CartItem[]): Promise<ApiResponse<{ synced: number }>> {
  const res = await authedFetch("/api/user/cart", "PUT", { brandSlug, items });
  return res.json();
}

export async function getBookmarks(brandSlug: string): Promise<ApiResponse<BookmarkedItem[]>> {
  const res = await authedFetch("/api/user/bookmarks", "POST", { brandSlug });
  return res.json();
}

export async function putBookmarks(brandSlug: string, items: BookmarkedItem[]): Promise<ApiResponse<{ synced: number }>> {
  const res = await authedFetch("/api/user/bookmarks", "PUT", { brandSlug, items });
  return res.json();
}

export async function getOrders(brandSlug: string): Promise<ApiResponse<Order[]>> {
  const res = await authedFetch("/api/user/orders", "POST", { brandSlug });
  return res.json();
}

export async function createCheckoutSession(
  brandSlug: string,
  items: { productSlug: string; sku: string; priceCents: number; quantity: number }[],
  successUrl: string,
  cancelUrl: string,
): Promise<CheckoutResponse> {
  const res = await authedFetch("/api/user/checkout", "POST", { brandSlug, items, successUrl, cancelUrl });
  if (res.ok) {
    const json: ApiResponse<{ url: string }> = await res.json();
    return json.success ? { success: true, url: json.data.url } : { success: false, items: [] };
  }
  return { success: false, items: await res.json() };
}
