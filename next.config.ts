import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'katsumascore.blog',
        pathname: '/wp-content/uploads/**',
      },
    ],
    // ローカル開発環境では katsumascore.blog が NAT64 プライベートIPに解決されるため
    // Next.js の画像最適化をバイパスして直接 URL を使用する
    unoptimized: process.env.NODE_ENV === 'development',
  },
  i18n: {
    locales: ['default', 'ja', 'en'],
    defaultLocale: 'default',
    localeDetection: false,
  },
  async redirects() {
    return [
      {
        source: "/author/:slug",
        destination: "/404",
        permanent: false,
      },
      // 月別アーカイブ
      {
        source: "/:year(\\d{4})/:month(\\d{2})",
        destination: "/404",
        permanent: false,
      },
      // タグアーカイブ
      {
        source: "/tag/:slug",
        destination: "/404",
        permanent: false,
      },
    ];
  },
  sassOptions: {
    additionalData: `@use "${path.resolve('./src/styles/scss/global/variable/colors.scss')}" as *; @use "${path.resolve('./src/styles/scss/global/variable/fontWeight.scss')}" as *;`,
  },
};

export default nextConfig;
