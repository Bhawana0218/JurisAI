import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth", "bcryptjs", "pg"],
};

export default nextConfig;
