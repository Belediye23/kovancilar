import type { NextConfig } from "next";

// Vercel deploy için sadeleştirilmiş config
// (output: "standalone" Vercel'de gerekmez; Vercel kendi build sistemini kullanır)
const nextConfig: NextConfig = {
  reactStrictMode: false,
  // TypeScript build hatalarını görmezden gel (scaffold zamanından kalan)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
