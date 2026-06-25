export type Brand = { id: string; name: string; slug: string };

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  children?: CategoryNode[];
};

export type ListVariation = {
  option: string;
  slug: string;
  value?: string;
  imageSrc: string | null;
  imageName: string | null;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  minPriceCents: number;
  maxPriceCents: number;
  salePriceCents: number | null;
  featured: boolean;
  sale: boolean;
  imageSrc: string | null;
  imageName: string | null;
  variations?: ListVariation[];
};

export type ProductsResponse = {
  products: ProductListItem[];
  page: number;
  size: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
};

export type VariationImage = { src: string; name: string; sortOrder: number };

export type Variation = {
  sku: string;
  attribute: { name: string; slug: string }[];
  sale: boolean;
  regularPriceCents: number;
  salePriceCents: number | null;
  images: VariationImage[];
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  summary: string[];
  attributes: { name: string; options: { option: string; slug: string; value?: string }[] }[];
  featured: boolean;
  sale: boolean;
  minPriceCents: number;
  maxPriceCents: number;
  salePriceCents: number | null;
  variations: Variation[];
  productImages: VariationImage[];
  descriptionImages: { src: string; name: string }[];
};

export type CartAttribute = { name: string; option: string; slug: string };

export type CartItem = {
  productId: string;
  productSlug: string;
  sku: string;
  attribute: CartAttribute[];
  name: string;
  imageSrc: string;
  priceCents: number;
  quantity: number;
};

export type BookmarkedItem = {
  productId: string;
  productSlug: string;
  name: string;
  imageSrc: string;
};

export type OrderItem = {
  id: string;
  productSlug: string;
  name: string;
  imageSrc: string;
  priceCents: number;
  quantity: number;
  attribute: string | null;
};

export type ShippingAddress = {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  status: string;
  totalCents: number;
  shippingAddress: ShippingAddress | null;
  createdAt: string;
  items: OrderItem[];
};

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export type ValidateCartItem = { productSlug: string; sku: string; exists: boolean; priceCents: number | null; priceChanged: boolean };

export type CheckoutResponse = { success: true; url: string } | { success: false; items: ValidateCartItem[] };
