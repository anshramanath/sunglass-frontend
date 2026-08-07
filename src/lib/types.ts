export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  children?: CategoryNode[];
};

export type ListVariation = {
  id: string;
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
  sku: string | null;
  minPriceCents: number;
  maxPriceCents: number;
  salePriceCents: number | null;
  featured: boolean;
  sale: boolean;
  imageSrc: string;
  imageName: string;
  variations: ListVariation[];
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
  status: "processing" | "shipped" | "refunded";
  totalCents: number;
  refundedCents: number | null;
  carrier: string | null;
  trackingNumber: string | null;
  shippingAddress: ShippingAddress | null;
  createdAt: string;
  items: OrderItem[];
};

export type ApiResponse<T, E = never> = { success: true; data: T } | { success: false; message: string; data?: E };

export type ValidateCartItem = { productSlug: string; sku: string; exists: boolean; priceCents: number | null; priceChanged: boolean };

export type CartValidationResult = { data: ValidateCartItem[]; status: number };

export type CheckoutUrl = { url: string };

export type SyncedResponse = { synced: number };

export type TBYBPackage = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  pairsMin: number;
  pairsMax: number;
  imageSrc: string;
  brands: string[];
};

export type TBYBSubmissionRecord = {
  id: string;
  packageName: string; packageSlug: string; packagePriceCents: number; packageImageSrc: string; packagePairsMin: number; packagePairsMax: number; packageBrands: string[];
  odSphere: string; odCylinder: string; odAxis: string;
  osSphere: string; osCylinder: string; osAxis: string;
  lensType: string; helmetSize: string; hatSize: string;
  noseBridge: string; buyingPreference: string; frameType: string;
  specialRequests: string; prescriptionUrl: string; headshotUrl: string;
  contactName: string; contactEmail: string; contactPhone: string;
  refundedCents: number | null; shippingAddress: ShippingAddress | null;
  carrier: string | null; trackingNumber: string | null;
  status: string; createdAt: string; updatedAt: string;
};

export type TBYBSubmission = {
  packageId: string;
  odSphere: string | null; odCylinder: string | null; odAxis: string | null;
  osSphere: string | null; osCylinder: string | null; osAxis: string | null;
  lensType: string | null; helmetSize: string | null; hatSize: string | null;
  noseBridge: string | null; sunglassFit: string | null; frameType: string | null;
  comments: string; name: string; email: string; phone: string;
  prescriptionUrl: string | null; headshotUrl: string | null;
};
