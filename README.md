# prosport-frontend

Multi-brand storefront built with Next.js 16 App Router. A single codebase serves multiple brands (proSPORT Sunglasses, BikerShades, Sunglass Monster) — the active brand is selected via environment variable.

## Stack

- **Next.js 16** — App Router, server components, server actions, Turbopack
- **Tailwind CSS v4** — design system tokens in `globals.css`
- **Supabase** — auth (SSR cookie-based), cart and bookmark storage
- **@supabase/ssr** — server-side session management
- **Radix UI / shadcn** — Sheet component for slide-over panels

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_BRAND_SLUG=prosport-sunglasses   # or bikershades / sunglass-monster
BASE_URL=https://your-backend-url            # server-only, used in server actions
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Multi-Brand

All brand config (name, logo, accent colour, hero copy) lives in `src/lib/brand.ts`. The `BRAND_SLUG` env var picks the active brand at build time. The accent colour is injected as a CSS variable (`--color-brand`) on the root element, so all brand-coloured UI updates automatically.

To add a brand: add an entry to the `BRANDS` object in `brand.ts` and deploy a new instance with the corresponding `NEXT_PUBLIC_BRAND_SLUG`.

## Project Structure

```
src/
├── app/
│   ├── (shop)/              # Main storefront — Navbar + Footer layout
│   │   ├── page.tsx         # Home / landing
│   │   ├── category/        # Category pages with filters + load-more pagination
│   │   ├── product/         # Product detail page
│   │   └── sale/            # Sale page (separate endpoint, price filters only)
│   ├── (bare)/              # Minimal layout (no Navbar/Footer)
│   │   ├── signin/          # Sign in + sign up forms
│   │   ├── account/         # Account details + sign out
│   │   └── checkout/        # Checkout flow
│   └── layout.tsx           # Root layout — Providers mounted here
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        # Sticky nav — categories, auth, header icons
│   │   ├── AnnouncementBar.tsx # Scrolling promo marquee + brand switcher tabs
│   │   ├── HeaderIcons.tsx   # Search / Saved / Bag panels + badge animations
│   │   └── Footer.tsx
│   ├── providers/
│   │   ├── AuthProvider.tsx  # loggedIn state + setLoggedIn — no Supabase listener
│   │   ├── CartProvider.tsx  # localStorage + DB sync, merges on auth change
│   │   ├── BookmarkProvider.tsx
│   │   └── Providers.tsx     # Composes all providers
│   └── product/
│       ├── LoadMoreProducts.tsx
│       └── LoadMoreSaleProducts.tsx
└── lib/
    ├── api.ts               # All server actions — public catalog + authed user data
    ├── brand.ts             # Brand config and BRAND export
    ├── supabase/
    │   ├── auth.ts          # signIn, signOut, getSession, requireUser
    │   ├── client.ts        # Browser Supabase client
    │   └── server.ts        # Server Supabase client (reads cookies)
    └── categoryUtils.ts     # Tree traversal helpers
```

## Auth Flow

Sign-in and sign-out are server actions. The session is stored as a cookie by `@supabase/ssr`. No client-side Supabase listener is used.

- **Sign in** (`SignInForm`) — calls `signIn()` server action, on success calls `setLoggedIn(true)` then `router.push("/")`
- **Sign out** (`SignOutButton`) — calls `setLoggedIn(false)`, then `router.push("/")`, then `await signOut()` — navigation happens before session is cleared to avoid `requireUser()` redirecting mid-transition
- `AuthProvider` exposes `useLoggedIn()` and `useSetLoggedIn()` — no effects, just state

## Cart & Bookmark Sync

Both providers follow the same pattern:

1. On mount: read localStorage → call `getCart`/`getBookmarks` (server action, checks session via cookie) → if DB returns data, merge → fire-and-forget PUT to DB → set state
2. **Merge rule**: DB wins on same product slug — no quantity summing
3. **`loggedIn` dependency**: sync effect re-runs when `loggedIn` changes (sign-in or sign-out)
4. **Debounced PUT** (800ms): handles normal add/remove/qty changes after initial load
5. **Providers are at root**: never unmount across navigations, so debounce timers persist

## Category Filters

Filter slugs (`under-15`, `15-25`, `25-plus`, `sale`) are passed as `?filter=<slug>`. The backend translates them via a hardcoded `FILTER_MAP` — price logic is never exposed in the URL. A `<Suspense key={filter}>` forces remount on filter change to prevent Next.js from serving cached results.

## API

All data fetching goes through `src/lib/api.ts` (server actions, `"use server"`). Two sections:

- **Public catalog** — `getCategories`, `getProducts`, `getSaleProducts`, `getItem`, `searchProducts`
- **Authed user data** — `getCart`, `putCart`, `getBookmarks`, `putBookmarks`

The backend is a separate deployment. `BASE_URL` is a server-only env var used in all fetch calls.
