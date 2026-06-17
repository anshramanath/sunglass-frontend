# ProSport Frontend — What Was Built & Learned

## Project Overview

A Next.js 15 (App Router) e-commerce storefront for a sunglass brand. Backend is a separate Express/Django API. Auth via Supabase SSR. All styling in Tailwind CSS.

---

## Architecture

```
prosport-frontend/src/
├── app/
│   ├── (shop)/                    # Navbar + footer layout
│   │   ├── page.tsx               # Homepage
│   │   ├── category/[...path]/    # Category pages with filters
│   │   ├── product/[slug]/        # Product detail page
│   │   └── sale/                  # Sale page
│   ├── (bare)/                    # Minimal header layout
│   │   ├── signin/                # Sign in / sign up
│   │   ├── account/               # Account page
│   │   └── checkout/              # Checkout
│   └── layout.tsx                 # Root — Providers wrapper
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx             # Logo + nav links + HeaderIcons
│   │   ├── HeaderIcons.tsx        # Search / Saved / Bag / Account panels
│   │   └── NavMenu.tsx            # Desktop navigation menu
│   ├── product/
│   │   ├── ProductCard.tsx        # Grid card with hover scale
│   │   ├── ProductGrid.tsx        # Responsive grid
│   │   ├── LoadMoreProducts.tsx   # Client — paginated load more
│   │   ├── ProductDetail.tsx      # PDP — variation picker, add to bag
│   │   └── ImageGallery.tsx       # PDP image carousel
│   ├── checkout/
│   │   └── CheckoutPageClient.tsx # Client — full checkout UI
│   ├── providers/
│   │   ├── CartProvider.tsx       # Context — localStorage cart
│   │   ├── BookmarkProvider.tsx   # Context — localStorage saved
│   │   └── Providers.tsx          # Wraps both
│   └── shared/
│       ├── LoadingSkeleton.tsx    # Suspense fallback skeleton
│       └── EmptyState.tsx
├── lib/
│   ├── api.ts                     # Server-only fetch helpers
│   ├── types.ts                   # Shared TS types
│   ├── brand.ts                   # Brand constants (name, logo, slug)
│   ├── categoryUtils.ts           # findPathNodes — tree lookup
│   └── supabase/
│       ├── client.ts              # Browser Supabase client
│       ├── server.ts              # SSR Supabase client (cookies)
│       └── auth.ts                # Server actions: signIn, signUp, signOut, requireUser
└── middleware.ts                  # Refreshes Supabase session on every request
```

---

## What Was Built

### 1. Category Page with Streaming (`category/[...path]/page.tsx`)

Slug-based routing catches any depth of category tree (`/category/sunglasses/sport`).

**Pattern:** Server component splits into two phases:
- CategoryPage (renders instantly): breadcrumb, filter chips
- ProductSection (async server component inside `<Suspense>`): fetches products, passes to client

```tsx
async function ProductSection({ categoryId, sale, categoryPath }) {
  const data = await getProducts({ brandSlug: BRAND_SLUG, categoryId, sale, size: 20 });
  return <LoadMoreProducts initialProducts={data.products} ... />;
}

// In CategoryPage:
<Suspense fallback={<LoadingSkeleton />}>
  <ProductSection ... />
</Suspense>
```

**Why this works:** The `await` is inside `ProductSection`, which is inside `<Suspense>`. So breadcrumb + filters stream immediately and the product grid streams in after the fetch.

**Filters:** `["Under $15", "$15 – $25", "$25+", "Sale"]` — rendered as `<Link>` chips that toggle `?filter=` in the URL. `Sale` filter passes `sale: true` to the API. All filter state is in the URL so it's SEO-safe and shareable.

**Metadata:** `generateMetadata` looks up the leaf node name for the page `<title>`.

---

### 2. Load More (`LoadMoreProducts.tsx`)

Client component. Gets initial products as props (from server). On "Load More", calls `getProducts` (server action) with `page + 1` and appends results.

Uses `useTransition` so the button shows "Loading…" without blocking the UI.

---

### 3. Header Panels — Bag, Saved, Search (`HeaderIcons.tsx`)

Three `<Sheet>` slide-in panels triggered by navbar icons. All in one client component.

**Item layout (Bag + Saved):**
- `flex items-start gap-5` outer row — `items-start` prevents image stretching
- `w-[90px] aspect-[4/5]` portrait image with `object-contain mix-blend-multiply`
- Right column: name + Remove on top row, stepper/action + price on bottom row
- `truncate` on name to prevent multi-line overflow breaking layout

**Search panel:** 2-column grid, `aspect-[4/5]` images with `p-4 object-contain mix-blend-multiply`.

**Auth-aware:** `isSignedIn` prop switches between Account icon link and "Sign In" text link.

---

### 4. Checkout Page (`CheckoutPageClient.tsx`)

Same item layout as Bag panel — `items-start`, `w-20 aspect-[4/5]`, name+Remove top, stepper+price bottom.

---

### 5. Product Detail (`ProductDetail.tsx`)

Variation picker, image gallery, add to bag / bookmark. Fixed bug: was passing `product.id` as `productSlug` to cart. Fixed by accepting `slug` as a separate prop from the page (which has it from URL params), since `ProductDetail` type doesn't include slug.

```tsx
// page.tsx
<ProductDetail product={product} slug={slug} />

// ProductDetail.tsx
export default function ProductDetail({ product, slug }: { product: ProductDetail; slug: string }) {
  // add to cart uses: productSlug: slug
}
```

---

### 6. Auth (`lib/supabase/auth.ts`)

All server actions in one file. Server-only Supabase client throughout.

```ts
requireUser()   // returns User or redirects to /signin
signIn()        // signInWithPassword, redirects to /
signUp()        // signUp with display_name, then auto signIn, redirects to /
signOut()       // signOut, redirects to /
```

**Sign up auto-login:** After `signUp`, immediately calls `signInWithPassword` so the user is logged in regardless of Supabase email confirmation settings.

**Display name:** Stored in `user_metadata.display_name` (Supabase's field for this, not `full_name`).

---

### 7. Sign In / Sign Up UI

**`AuthForms.tsx`** — client component, holds `mode: "signin" | "signup"` state, swaps between forms.

**`SignInForm.tsx` / `SignUpForm.tsx`** — old `e.preventDefault()` pattern with controlled inputs and `useState` for error + pending. Call server actions directly.

**`SignUpForm.tsx`** fields: Full Name, Email Address, Password (with show/hide toggle).

---

### 8. Account Page (`(bare)/account/page.tsx`)

Server component, protected by `requireUser()`.

- Header: `Hi, {displayName}` (or just `Hi` if no name)
- "My Account" label + Sign Out button on the same line (`flex justify-between`)
- Account Details section: Name (if set), Email, Member Since (formatted as `June 2026`)
- Order History section (placeholder)

---

### 9. Middleware (`middleware.ts`)

Calls `supabase.auth.getUser()` on every request. This triggers a token refresh if the access token has expired, writing updated cookies back to the response. Without it, server components that call `createClient()` would see a logged-out user after the JWT expires (~1 hour).

---

## Key Things Learned / Gotchas

### Suspense only catches awaits INSIDE the suspended component

If the parent component does `await getProducts()` and then renders `<Suspense>`, the Suspense boundary is a no-op — the parent already waited. The `await` must be inside the component that's inside `<Suspense>`.

```tsx
// WRONG — Suspense does nothing, page blocks
export default async function Page() {
  const data = await getProducts(); // ← await here blocks everything
  return <Suspense><ProductList data={data} /></Suspense>;
}

// CORRECT — skeleton shows while ProductSection fetches
async function ProductSection() {
  const data = await getProducts(); // ← await inside the boundary
  return <ProductList data={data} />;
}
export default async function Page() {
  return <Suspense fallback={<Skeleton />}><ProductSection /></Suspense>;
}
```

### Client components cannot be async

`"use client"` components must be synchronous. They can't `await` at the top level. This means:
- They can't suspend on their own (no Suspense boundary effect)
- Data fetching in client components goes through `useEffect` or `useTransition`
- That's why `getProducts` for load-more is called inside `startTransition(async () => {})` — not at the top level

### Suspense is SEO-safe (streaming SSR)

The initial HTML that reaches the crawler includes the page shell + skeleton, then the real content streams in and replaces it via a `<script>` inject. The URL doesn't change. Filters in the URL (`?filter=Sale`) are read server-side so SEO content reflects the filter state.

### `useSearchParams` requires its own Suspense

Any client component that calls `useSearchParams()` must itself be wrapped in a `<Suspense>`. This was why moving filters into `LoadMoreProducts` broke skeleton support — it would have required a second Suspense boundary just for the params hook. Filters stayed in the server component.

### Supabase display name

Stored under `user.user_metadata.display_name`. Access via:
```ts
user.user_metadata?.display_name ?? ""
```
Set during sign up via `options: { data: { display_name: name } }`.

### `items-start` prevents image stretch in flex rows

When a flex row contains an image with an explicit aspect ratio, the default `items-stretch` will ignore the aspect ratio and stretch the image to fill the row height. `items-start` lets the image determine its own height from `aspect-[4/5]`.

### `truncate` for single-line product names

Product names that overflow break panel layouts. `truncate` (= `overflow-hidden text-ellipsis whitespace-nowrap`) keeps them on one line. Requires the parent to have `min-w-0` so it can actually shrink.

### `<Link>` renders as `<a>` (inline)

In a flex column, wrapping a product name in `<Link>` without `block` means it stays inline-level and sibling elements don't stack. Add `block` class to make it a block element.

---

## Pending / Not Yet Done

- Search panel: hover scale effect (same as ProductCard `group-hover:scale-[1.04] transition-transform duration-[420ms]`)
- Mobile hamburger menu (biggest mobile gap — currently a non-functional button)
- Deploy backend to Vercel with CORS fix
- Update Vercel frontend env: `NEXT_PUBLIC_BASE_URL` → `BASE_URL`
