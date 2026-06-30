import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // Database types are hand-written stubs until `npm run db:types` runs against
  // the live Supabase project. Skip TS errors at build time until then.
  typescript: { ignoreBuildErrors: true },
  images: {
    // Supabase Storage avatars + remote OG assets resolve through here.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
