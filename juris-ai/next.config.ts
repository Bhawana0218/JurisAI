import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",

  // Point Turbopack to monorepo root so it can resolve modules from
  // the root node_modules (e.g. zod) used by workspace packages.
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },

  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
