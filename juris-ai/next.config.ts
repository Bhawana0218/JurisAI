import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "pdf-parse",
      "mammoth",
      "bcryptjs",
      "pg",
    ],
  },
};

export default nextConfig;