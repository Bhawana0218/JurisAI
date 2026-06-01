import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moved from experimental.serverComponentsExternalPackages (Next.js 15+)
  serverExternalPackages: ["pdf-parse", "mammoth", "bcryptjs", "pg"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
