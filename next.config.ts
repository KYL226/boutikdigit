import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Évite certains crashs mémoire/pack cache sur Windows (RangeError: Array buffer allocation failed)
      config.cache = false
    }
    return config
  },
};

export default nextConfig;
