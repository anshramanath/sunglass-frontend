"use server";

const BRANDS = {
  "prosport-sunglasses": {
    name: "proSPORT Sunglasses",
    slug: "prosport-sunglasses",
    description: "Athletic sunglasses built for speed, clarity, and all-day performance.",
    logo: "/prosport-logo.jpg",
    hero: "/prosport-hero.jpg",
    accent: "#2EA3DC",
    heroCopy: {
      eyebrow: "Built for Motion",
      title: "Cut the glare.\nStay sharp.",
      body: "Athletic eyewear tuned for speed, clarity, and all-day comfort under pressure.",
    },
    editorial: [
      { body: "Built for the road ahead" },
      { body: "See every angle, miss nothing" },
    ],
  },
  "bikershades": {
    name: "BikerShades",
    slug: "bikershades",
    description: "Rider-first eyewear made for wind, glare, and the road ahead.",
    logo: "/bikershades-logo.jpg",
    hero: "/bikershades-hero.jpg",
    accent: "#C93A2B",
    heroCopy: {
      eyebrow: "Built for the Ride",
      title: "Beat the wind.\nSee the road.",
      body: "Protective rider-first eyewear made for open roads, bright glare, and the miles ahead.",
    },
    editorial: [
      { body: "Wind, sun, no limits" },
      { body: "Miles ahead, nothing missed" },
    ],
  },
  "sunglass-monster": {
    name: "Sunglass Monster",
    slug: "sunglass-monster",
    description: "Bold, fashion-forward sunglasses with standout style and easy all-day wear.",
    logo: "/sunglass-monster-logo.jpg",
    hero: "/sunglass-monster-hero.jpg",
    accent: "#E0522D",
    heroCopy: {
      eyebrow: "Statement Shades",
      title: "Bold frames.\nNo apologies.",
      body: "Fashion-forward sunglasses with standout attitude, easy comfort, and all-day wearability.",
    },
    editorial: [
      { body: "Colour meets confidence" },
      { body: "Frame the moment" },
    ],
  },
} as const;

export async function getBrand() {
  return BRANDS[process.env.BRAND_SLUG as keyof typeof BRANDS];
}
