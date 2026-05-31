import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output bundles only the files needed for production.
  // Remove this if deploying to Vercel (Vercel handles bundling itself).
  // output: "standalone",

  serverExternalPackages: ["pdf-parse", "mammoth", "bcryptjs"],

  experimental: {
    // Suppress the "missing Suspense boundary" warning that fires when a
    // client component using useSearchParams is rendered without a boundary.
    // This is a warning, not an error, but it can cause build noise.
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
