import type { NextConfig } from "next";

const s3Host = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).hostname : null;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: __dirname },
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920, 2400],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: s3Host ? [{ protocol: "https", hostname: s3Host }] : [],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
