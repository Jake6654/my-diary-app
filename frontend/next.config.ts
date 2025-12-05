import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eensskjncsooyuxbfokm.supabase.co",
        pathname: "/storage/v1/object/public/diary-illustrations/**",
      },
    ],
  },
};

export default nextConfig;
