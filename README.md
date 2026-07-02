# sunglass-frontend

Next.js storefront for a multi-brand sunglasses e-commerce platform. Multiple brands share one codebase — all data is scoped by `brand_slug` at the API layer.

**Stack:** Next.js 16 · Supabase (SSR auth) · Stripe · TypeScript · Tailwind CSS v4

**Backend:** [`sunglass-server`](https://github.com/anshramanath/sunglass-server) — API routes, Postgres, Stripe webhooks

---

## Pages & Routes

```
src/app/
├── (shop)/                          # Full layout — nav, announcement bar, footer
│   ├── page.tsx                     # Homepage — featured products, category grid
│   ├── category/[...path]/page.tsx  # Category listing with subcategory filters
│   ├── product/[slug]/page.tsx      # Product detail — Suspense streaming
│   └── sale/page.tsx                # Sale listing with price-range filters
│
├── (bare)/                          # Minimal layout — logo + back link only
│   ├── account/page.tsx             # Order history, account details, shipping address
│   ├── checkout/page.tsx            # Cart review before Stripe redirect
│   ├── order/
│   │   ├── success/page.tsx         # Post-checkout confirmation, clears cart, redirects home
│   │   └── failure/page.tsx         # Payment failure with retry link
│   └── signin/page.tsx              # Sign in / sign up forms
│
├── not-found.tsx                    # Global 404 — no layout chrome
└── layout.tsx                       # Root layout — fonts, providers
```

---

## Structure

```
src/
├── app/                             # Pages (above)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx               # Top nav — logo, category links, icon strip
│   │   ├── HeaderIcons.tsx          # Search, saved, and bag slide-out panels
│   │   ├── AnnouncementBar.tsx      # Scrolling top banner, brand switcher
│   │   └── Footer.tsx
│   │
│   ├── product/
│   │   ├── ProductCard.tsx          # Grid card — color swatches, hover preview, heart
│   │   ├── ProductGrid.tsx          # Responsive product grid
│   │   └── LoadMoreProducts.tsx     # Generic infinite scroll — takes a fetchPage callback
│   │                                # Route-level LoadMore.tsx wrappers close over their own fetch fn
│   │
│   ├── providers/
│   │   ├── Providers.tsx            # Wraps all client providers
│   │   ├── AuthProvider.tsx         # Supabase session, exposes useLoggedIn
│   │   ├── CartProvider.tsx         # Cart state — localStorage + debounced DB sync
│   │   └── BookmarkProvider.tsx     # Bookmark state — localStorage + debounced DB sync
│   │
│   └── shared/
│       ├── Sheet.tsx                # Radix sheet primitive (slide-out panels)
│       ├── LoadingSkeleton.tsx      # Pulse skeleton for product grids
│       └── EmptyState.tsx           # Empty state for product grids
│
└── lib/
    ├── api.ts                       # All fetch calls to sunglass-server
    ├── auth.ts                      # requireUser() — server-side session guard
    ├── brand.ts                     # Brand config — getBrand(), getBrands(), shortName, url
    ├── utils.ts                     # formatPrice(), collectLeaves()
    └── types.ts                     # Shared TypeScript types
```

---

## What's Built

### Storefront
- Category pages with subcategory pill filters and infinite scroll
- Sale page with price-range filters (`under-15`, `15-25`, `25-plus`)
- Product detail page with Suspense streaming — breadcrumb renders instantly from URL params, product detail and related products stream in parallel

### Product Detail
- `selections: Record<string, string>` — maps attr name → slug, starts empty or from URL params
- Color is always first; other attrs show only options available given current selections (`availableByAttr`)
- Unavailable options are clickable (resets selections) with a diagonal SVG line overlay — not `disabled`
- Selecting the same option again deselects it; selecting a different option in an already-chosen attr resets all other selections
- Price display: no SKU resolved → show range or single; SKU resolved + on sale → strikethrough; else → regular price
- URL carries all selected attrs as params (`?color=gloss-black&size=medium`) — all are applied as `initialSelections` on load
- Image gallery switches to the selected variation's images automatically

### ProductCard
- Color swatches sourced from `product.variations`, rendered as `<Link>` elements (not buttons)
- Hover previews the variation image; `href` includes `?color=slug` for the hovered swatch
- Up to 5 swatches shown, `+N` text for overflow
- Sale badge and Best Seller badge on the image; strikethrough price only for simple (non-variable) products on sale
- `categoryPath` derived internally from `usePathname()` — not passed as a prop

### Cart
- Identity key: `${productSlug}:${sku}` — composite because two products can share a SKU
- Persists to localStorage immediately and to DB with 800ms debounce
- Checkout validates cart on mount — removes non-existent items, updates stale prices in place via `useUpdateCartPrice`
- Cart cleared immediately on the success page (mount), not at countdown end

### Account
- Order history with status badge, line items, and per-order shipping address
- Account details — email, name, member since, and latest shipping address derived from the most recent order

### Checkout
- Cart review page before Stripe redirect
- Stripe hosted checkout handles address collection
- `will-change-transform` on the loading spinner keeps the CSS animation running on the GPU compositor thread during `window.location.href` navigation

---

## Multi-brand

All API calls include `brand_slug`. `src/lib/brand.ts` defines all brands with name, slug, logo, accent color, `shortName`, and `url`. `getBrand()` returns the active brand via `NEXT_PUBLIC_BRAND_SLUG`. `getBrands()` returns all brands sorted with the active brand first — used by the announcement bar brand switcher. One deployment per brand.
