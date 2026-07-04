const BRANDS = {
  "prosport-sunglasses": {
    name: "proSPORT Sunglasses",
    shortName: "proSport",
    slug: "prosport-sunglasses",
    url: "https://prosport-sunglasses-frontend.vercel.app",
    favicon: "/prosport-sunglasses/favicon.png",
    description: "Athletic sunglasses built for speed, clarity, and all-day performance.",
    logo: "/prosport-sunglasses/logo.jpg",
    hero: "/prosport-sunglasses/hero.jpg",
    accent: "#2EA3DC",
    heroCopy: {
      eyebrow: "Built for Motion",
      title: "Cut the glare.\nStay sharp.",
      body: "Athletic eyewear tuned for speed, clarity, and all-day comfort under pressure.",
    },
    categoryImages: [
      "/prosport-sunglasses/cat-1.jpg",
      "/prosport-sunglasses/cat-2.jpg",
      "/prosport-sunglasses/cat-3.jpg",
      "/prosport-sunglasses/cat-4.jpg",
      "/prosport-sunglasses/cat-5.jpg",
    ],
    editorial: [
      { body: "Built for the road ahead", image: "/prosport-sunglasses/edit-1.jpg" },
      { body: "See every angle, miss nothing", image: "/prosport-sunglasses/edit-2.jpg" },
    ],
  },
  "bikershades": {
    name: "BikerShades",
    shortName: "BikerShades",
    slug: "bikershades",
    url: "https://bikershades-frontend.vercel.app",
    favicon: "/bikershades/favicon.png",
    description: "Rider-first eyewear made for wind, glare, and the road ahead.",
    logo: "/bikershades/logo.jpg",
    hero: "/bikershades/hero.jpg",
    accent: "#C93A2B",
    heroCopy: {
      eyebrow: "Built for the Ride",
      title: "Beat the wind.\nSee the road.",
      body: "Protective rider-first eyewear made for open roads, bright glare, and the miles ahead.",
    },
    categoryImages: [
      "/bikershades/cat-1.jpg",
      "/bikershades/cat-2.jpg",
      "/bikershades/cat-3.jpg",
      "/bikershades/cat-4.jpg",
      "/bikershades/cat-5.jpg",
    ],
    editorial: [
      { body: "Wind, sun, no limits", image: "/bikershades/edit-1.jpg" },
      { body: "Miles ahead, nothing missed", image: "/bikershades/edit-2.jpg" },
    ],
  },
  "sunglass-monster": {
    name: "Sunglass Monster",
    shortName: "SGM",
    slug: "sunglass-monster",
    url: "https://sunglass-monster-frontend.vercel.app",
    favicon: "/sunglass-monster/favicon.png",
    description: "Bold, fashion-forward sunglasses with standout style and easy all-day wear.",
    logo: "/sunglass-monster/logo.jpg",
    hero: "/sunglass-monster/hero.jpg",
    accent: "#E0522D",
    heroCopy: {
      eyebrow: "Statement Shades",
      title: "Bold frames.\nNo apologies.",
      body: "Fashion-forward sunglasses with standout attitude, easy comfort, and all-day wearability.",
    },
    categoryImages: [
      "/sunglass-monster/cat-1.jpg",
      "/sunglass-monster/cat-2.jpg",
      "/sunglass-monster/cat-3.jpg",
      "/sunglass-monster/cat-4.jpg",
      "/sunglass-monster/cat-5.jpg",
    ],
    editorial: [
      { body: "Colour meets confidence", image: "/sunglass-monster/edit-1.jpg" },
      { body: "Frame the moment", image: "/sunglass-monster/edit-2.jpg" },
    ],
  },
} as const;

export function getBrand() {
  return BRANDS[process.env.NEXT_PUBLIC_BRAND_SLUG as keyof typeof BRANDS];
}

export function getBrands() {
  const current = getBrand();
  return Object.values(BRANDS)
    .map(({ shortName, slug, url }) => ({ shortName, slug, url }))
    .sort((a, b) => (a.slug === current.slug ? -1 : b.slug === current.slug ? 1 : 0));
}
