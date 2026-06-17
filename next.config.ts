import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "zgcekcoatiskqbdruadg.supabase.co" }],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
