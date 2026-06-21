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
│   │   ├── NavMenu.tsx              # Mega menu for category navigation
│   │   ├── AnnouncementBar.tsx      # Scrolling top banner, brand switcher
│   │   └── Footer.tsx
│   │
│   ├── product/
│   │   ├── ProductCard.tsx          # Grid card — color swatches, hover preview, heart
│   │   ├── ProductDetail.tsx        # Buy rail — variation selector, add to bag, bookmark
│   │   ├── ProductGrid.tsx          # Responsive product grid
│   │   ├── ImageGallery.tsx         # Thumbnail strip + main image viewer
│   │   ├── LoadMoreProducts.tsx     # Infinite scroll for category pages
│   │   └── LoadMoreSaleProducts.tsx # Infinite scroll for sale page
│   │
│   ├── providers/
│   │   ├── Providers.tsx            # Wraps all client providers
│   │   ├── AuthProvider.tsx         # Supabase session, exposes useLoggedIn
│   │   ├── CartProvider.tsx         # Cart state — localStorage + debounced DB sync
│   │   └── BookmarkProvider.tsx     # Bookmark state — localStorage + debounced DB sync
│   │
│   └── shared/
│       └── LoadingSkeleton.tsx      # Pulse skeleton for product grids
│
└── lib/
    ├── api.ts                       # All fetch calls to sunglass-server
    ├── auth.ts                      # requireUser() — server-side session guard
    ├── brand.ts                     # BRAND config — name, slug, logo, accent color
    └── types.ts                     # Shared TypeScript types
```

---

## What's Built

### Storefront
- Category pages with subcategory pill filters and infinite scroll
- Sale page with price-range filters (`under-15`, `15-25`, `25-plus`)
- Product detail page with Suspense streaming — breadcrumb renders instantly from URL params, product detail and related products stream in parallel

### Product Detail
- Variation selector with color-first ordering — color is always the primary attribute and always fully available regardless of other selections
- Secondary attrs (e.g. lens type) filtered by what combinations exist with the selected color
- Color attributes render as hex circles with `ring-offset` selection ring; other attrs render as text buttons
- URL carries color as a slug (`?color=gloss-black`) — resolved to option name on load
- Image gallery switches to the selected variation's images automatically

### ProductCard
- Color swatches sourced from `product.variations` (deduped by color slug, one entry per unique color)
- Hover previews the variation image; click navigates to the product page with `?color=slug`
- Up to 5 swatches shown, `+ N` for overflow
- Heart bookmark button, Sale and Best Seller badges

### Cart
- Identity key: `${productSlug}:${sku}` — composite because two products can share a SKU
- Persists to localStorage immediately and to DB with 800ms debounce
- On Stripe redirect back, a 5-second countdown on the success page delays `clear()` until the async DB sync has completed, preventing the sync from restoring cleared items

### Account
- Order history with status badge, line items, and per-order shipping address
- Account details — email, name, member since, and latest shipping address derived from the most recent order

### Checkout
- Cart review page before Stripe redirect
- Stripe hosted checkout handles address collection
- `will-change-transform` on the loading spinner keeps the CSS animation running on the GPU compositor thread during `window.location.href` navigation

---

## Multi-brand

All API calls include `brand_slug`. The `BRAND` config in `src/lib/brand.ts` sets the active brand — name, slug, logo, and accent color. One deployment per brand.
