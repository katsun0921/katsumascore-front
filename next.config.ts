import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
  },
  async redirects() {
    return [
      {
        source: "/author/:slug",
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
