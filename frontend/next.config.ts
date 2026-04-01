import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['127.0.0.1'],

  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:8000'
      : process.env.NEXT_PUBLIC_BACKEND_URL;

    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;