"use server";

import type { ApiResponse, BookmarkedItem, CartItem, CartValidationResult, CategoryNode, CheckoutUrl, Order, ProductDetail, ProductListItem, ProductsResponse, SyncedResponse, ValidateCartItem } from "@/lib/types";
import { redirect, notFound } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL!;
const BRAND_SLUG = process.env.NEXT_PUBLIC_BRAND_SLUG!;

// ── Public catalog ────────────────────────────────────────────────────────────

async function apiFetch(path: string, params: Record<string, string | number>): Promise<Response> {
  try {
    const url = new URL(`${SERVER_BASE_URL}${path}`);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    return fetch(url.toString(), { next: { revalidate: 60 } });
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Network error!" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

export async function getCategories(): Promise<CategoryNode[]> {
  const res = await apiFetch("/api/public/categories", { brandSlug: BRAND_SLUG });

  const json: ApiResponse<CategoryNode[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 500:
        redirect("/try-again");

      case 503:
        redirect("/try-again");
      
      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function getFiller(n: number): Promise<ProductListItem[]> {
  const res = await apiFetch("/api/public/filler", { brandSlug: BRAND_SLUG, n });

  const json: ApiResponse<ProductListItem[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");
      
      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function getProducts(params: {
  categoryId: string;
  filter?: string;
  page?: number;
  size?: number;
}): Promise<ProductsResponse> {
  const query: Record<string, string | number> = {
    brandSlug: BRAND_SLUG,
    categoryId: params.categoryId,
    page: params.page ?? 1,
    size: params.size ?? 20,
  };

  if (params.filter) query.filter = params.filter;

  const res = await apiFetch("/api/public/products", query);

  const json: ApiResponse<ProductsResponse> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function getSaleProducts(params: {
  filter?: string;
  page?: number;
  size?: number;
}): Promise<ProductsResponse> {
  const query: Record<string, string | number> = {
    brandSlug: BRAND_SLUG,
    page: params.page ?? 1,
    size: params.size ?? 20,
  };

  if (params.filter) query.filter = params.filter;

  const res = await apiFetch("/api/public/sale", query);

  const json: ApiResponse<ProductsResponse> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function getItem(productSlug: string): Promise<ProductDetail> {
  const res = await apiFetch("/api/public/item", { brandSlug: BRAND_SLUG, productSlug });

  const json: ApiResponse<ProductDetail> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 404:
        notFound();

      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function searchProducts(search: string): Promise<ProductListItem[]> {
  const res = await apiFetch("/api/public/search", { brandSlug: BRAND_SLUG, search });

  const json: ApiResponse<ProductListItem[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

// ── Public POST (no auth, no cache) — unauthenticated JSON body requests ──────

async function publicPostFetch(path: string, body: unknown): Promise<Response> {
  try {
    return fetch(`${SERVER_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Network error!" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

export async function trackView(params: { categoryId?: string; productSlug?: string }) {
  await publicPostFetch("/api/public/views", { brandSlug: BRAND_SLUG, ...params });
}

export async function validateCart(items: { productSlug: string; sku: string; priceCents: number }[]): Promise<CartValidationResult> {
  const res = await publicPostFetch("/api/public/validate-cart", { brandSlug: BRAND_SLUG, items });

  const json: ApiResponse<ValidateCartItem[], ValidateCartItem[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        return { data: json.data ?? [], status: res.status };
    }
  }

  return { data: json.data, status: res.status };
}

// ── Authenticated user data ───────────────────────────────────────────────────

async function authedFetch(path: string, method: string, body: unknown): Promise<Response> {
  const user = await getUser();
  if (!user) return new Response(JSON.stringify({ success: false, message: "Unauthorized!" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const token = await getToken();

  try {
    return fetch(`${SERVER_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: "Network error!" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

export async function getCart(): Promise<CartItem[]> {
  const res = await authedFetch("/api/user/cart", "POST", { brandSlug: BRAND_SLUG });

  const json: ApiResponse<CartItem[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 401:
        throw new Error("Unauthorized");

      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function putCart(items: CartItem[]): Promise<SyncedResponse> {
  const res = await authedFetch("/api/user/cart", "PUT", { brandSlug: BRAND_SLUG, items });

  const json: ApiResponse<SyncedResponse> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 401:
        throw new Error("Unauthorized");

      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function getBookmarks(): Promise<BookmarkedItem[]> {
  const res = await authedFetch("/api/user/bookmarks", "POST", { brandSlug: BRAND_SLUG });

  const json: ApiResponse<BookmarkedItem[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 401:
        throw new Error("Unauthorized");

      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function putBookmarks(items: BookmarkedItem[]): Promise<SyncedResponse> {
  const res = await authedFetch("/api/user/bookmarks", "PUT", { brandSlug: BRAND_SLUG, items });

  const json: ApiResponse<SyncedResponse> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 401:
        throw new Error("Unauthorized");

      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function getOrders(): Promise<Order[]> {
  const res = await authedFetch("/api/user/orders", "POST", { brandSlug: BRAND_SLUG });
  
  const json: ApiResponse<Order[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 401:
        redirect("/sign-in");

      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        redirect("/try-again");
    }
  }

  return json.data;
}

export async function createCheckoutSession(
  items: { productSlug: string; sku: string; priceCents: number; quantity: number }[],
  successUrl: string,
  cancelUrl: string,
): Promise<CartValidationResult | CheckoutUrl> {
  const res = await authedFetch("/api/user/checkout", "POST", { brandSlug: BRAND_SLUG, items, successUrl, cancelUrl });

  const json: ApiResponse<CheckoutUrl, ValidateCartItem[]> = await res.json();

  if (!json.success) {
    switch(res.status) {
      case 401:
        redirect("/sign-in");

      case 500:
        throw new Error("Server error");

      case 503:
        throw new Error("Service unavailable");

      default:
        return { data: json.data ?? [], status: res.status };
    }
  }

  return json.data;
}
