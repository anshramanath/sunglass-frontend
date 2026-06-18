# API Reference

All endpoints return:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "Message" }
```

Authenticated endpoints require `Authorization: Bearer <supabase_access_token>`.

---

## Public Endpoints

### GET /api/public/brands

Returns all brands.

**Response**
```json
[
  { "id": "uuid", "name": "Sunglass Monster", "slug": "sunglass-monster" }
]
```

---

### GET /api/public/categories

Returns the full category tree for a brand. `sortOrder` is the authoritative ordering field.

**Query Params**
| Param | Required | Description |
|-------|----------|-------------|
| brandSlug | yes | Brand slug |

**Response**
```json
[
  {
    "id": "uuid",
    "name": "Sunglasses",
    "slug": "sunglasses",
    "sortOrder": 1,
    "children": [
      { "id": "uuid", "name": "Sport", "slug": "sport", "sortOrder": 1, "children": [] }
    ]
  }
]
```

---

### GET /api/public/products

Paginated products for a leaf category. Default page size is 20.

**Query Params**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| brandSlug | yes | — | Brand slug |
| categoryId | yes | — | Leaf category UUID |
| filter | no | — | Filter slug (see below) |
| page | no | 1 | Page number |
| size | no | 20 | Results per page (max 100) |

**Filter slugs**
| Slug | Effect |
|------|--------|
| `under-15` | `min_price_cents < 1500` |
| `15-25` | `1500 ≤ min_price_cents < 2500` |
| `25-plus` | `min_price_cents ≥ 2500` |
| `sale` | `sale = true` |

**Response**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Sport Sunglasses",
      "slug": "sport-sunglasses",
      "minPriceCents": 1650,
      "maxPriceCents": 1995,
      "salePriceCents": null,
      "attributes": [{ "name": "Color", "options": ["Black", "Tortoise"] }],
      "featured": false,
      "sale": false,
      "images": [{ "src": "https://...", "name": "Front" }]
    }
  ],
  "page": 1,
  "size": 20,
  "totalPages": 3,
  "totalProducts": 62,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

### GET /api/public/sale

Paginated sale products (`sale = true`). No `sale` filter slug — the endpoint is already scoped to sale items.

**Query Params**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| brandSlug | yes | — | Brand slug |
| filter | no | — | `under-15`, `15-25`, or `25-plus` |
| page | no | 1 | Page number |
| size | no | 20 | Results per page (max 100) |

**Response** — same shape as `/products`

---

### GET /api/public/item

Full product detail including variations, all images, and description images.

**Query Params**
| Param | Required | Description |
|-------|----------|-------------|
| brandSlug | yes | Brand slug |
| slug | yes | Product slug |

**Response**
```json
{
  "id": "uuid",
  "name": "Sport Sunglasses",
  "sku": null,
  "description": "Full description...",
  "summary": ["Feature 1", "Feature 2"],
  "attributes": [{ "name": "Color", "options": ["Black", "Tortoise"] }],
  "featured": false,
  "sale": false,
  "minPriceCents": 1650,
  "maxPriceCents": 1995,
  "salePriceCents": null,
  "stock": 10,
  "variations": [
    {
      "id": "uuid",
      "sku": "SKU-BLK",
      "attribute": [{ "name": "Color", "option": "Black" }],
      "sale": false,
      "regularPriceCents": 1650,
      "salePriceCents": null,
      "stock": 5,
      "images": [{ "src": "https://...", "name": "Black Front", "sortOrder": 1 }]
    }
  ],
  "productImages": [{ "src": "https://...", "name": "Front", "sortOrder": 1 }],
  "descriptionImages": [{ "src": "https://...", "name": "Diagram" }]
}
```

---

### GET /api/public/search

Case-insensitive product name search. Returns up to 6 results.

**Query Params**
| Param | Required | Description |
|-------|----------|-------------|
| brandSlug | yes | Brand slug |
| q | yes | Search query |

**Response**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Sport Sunglasses",
      "slug": "sport-sunglasses",
      "minPriceCents": 1650,
      "maxPriceCents": 1995,
      "salePriceCents": null,
      "attributes": [...],
      "featured": false,
      "sale": false,
      "images": [{ "src": "https://...", "name": "Front" }]
    }
  ]
}
```

---

### POST /api/public/validate-cart

Checks whether each cart item's product and variation still exist in the catalog. Call on cart page entry and before creating a checkout session.

**Body**
```json
{
  "brandSlug": "sunglass-monster",
  "items": [
    { "sku": "SKU-BLK" }
  ]
}
```

**Response**
```json
{
  "items": [
    { "sku": "SKU-BLK", "exists": true },
    { "sku": "SKU-OLD", "exists": false }
  ]
}
```

---

## Authenticated Endpoints

All require `Authorization: Bearer <supabase_access_token>`. Queries are scoped to `user_id` + `brand_slug` via RLS.

### GET /api/user/cart

Returns the user's cart items for a brand.

**Query Params**
| Param | Required | Description |
|-------|----------|-------------|
| brandSlug | yes | Brand slug |

**Response**
```json
{
  "items": [
    {
      "productSlug": "sport-sunglasses",
      "sku": "SKU-BLK",
      "attribute": [{ "name": "Color", "option": "Black" }],
      "name": "Sport Sunglasses",
      "imageSrc": "https://...",
      "priceCents": 1650,
      "quantity": 2
    }
  ]
}
```

---

### PUT /api/user/cart

Replaces the user's cart for a brand (delete + insert). Pass an empty array to clear.

**Body**
```json
{
  "brandSlug": "sunglass-monster",
  "items": [
    {
      "productSlug": "sport-sunglasses",
      "sku": "SKU-BLK",
      "attribute": [{ "name": "Color", "option": "Black" }],
      "name": "Sport Sunglasses",
      "imageSrc": "https://...",
      "priceCents": 1650,
      "quantity": 2
    }
  ]
}
```

**Response**
```json
{ "synced": 1 }
```

---

### GET /api/user/bookmarks

Returns the user's bookmarks for a brand.

**Query Params**
| Param | Required | Description |
|-------|----------|-------------|
| brandSlug | yes | Brand slug |

**Response**
```json
{
  "items": [
    {
      "productSlug": "sport-sunglasses",
      "attribute": [{ "name": "Color", "option": "Black" }],
      "name": "Sport Sunglasses",
      "imageSrc": "https://..."
    }
  ]
}
```

---

### PUT /api/user/bookmarks

Replaces the user's bookmarks for a brand (delete + insert). Pass an empty array to clear.

**Body**
```json
{
  "brandSlug": "sunglass-monster",
  "items": [
    {
      "productSlug": "sport-sunglasses",
      "attribute": [],
      "name": "Sport Sunglasses",
      "imageSrc": "https://..."
    }
  ]
}
```

**Response**
```json
{ "synced": 1 }
```

---

### POST /api/user/checkout

Creates a Stripe checkout session for the user's cart. Returns a URL to redirect the user to Stripe. Idempotent — same cart and order count returns the same session URL.

**Body**
```json
{
  "brandSlug": "sunglass-monster",
  "items": [
    {
      "productSlug": "sport-sunglasses",
      "sku": "SKU-BLK",
      "name": "Sport Sunglasses",
      "imageSrc": "https://...",
      "priceCents": 1650,
      "quantity": 2,
      "attribute": [{ "name": "Color", "option": "Black" }]
    }
  ],
  "successUrl": "https://yourdomain.com/order/success",
  "cancelUrl": "https://yourdomain.com/cart"
}
```

**Response**
```json
{ "url": "https://checkout.stripe.com/..." }
```

---

## Webhooks

### POST /api/webhooks/stripe

Stripe webhook handler. Verified via `stripe-signature` header. Only handles `checkout.session.completed`.

On payment completion: inserts an `orders` row and `order_items` rows derived from the Stripe line items. Idempotent — duplicate deliveries are ignored via `stripe_session_id` unique constraint.
