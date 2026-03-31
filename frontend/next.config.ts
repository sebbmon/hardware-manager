import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['127.0.0.1'],

  async rewrites() {
    // Rozpoznajemy środowisko
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev
      ? 'http://127.0.0.1:8000'
      : 'https://hardware-hub-mondel.onrender.com';

    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;