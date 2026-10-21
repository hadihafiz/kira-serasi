import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com;",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: blob:;",
      "font-src 'self' data: https://fonts.gstatic.com;",
      "connect-src 'self' https://vitals.vercel-insights.com;",
    ].join(" "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev only: allow testing from a phone on the same Wi-Fi (LAN addresses).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
