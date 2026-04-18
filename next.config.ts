import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
  },
  sassOptions: {
    additionalData: `@use "${path.resolve('./src/styles/scss/global/variable/colors.scss')}" as *; @use "${path.resolve('./src/styles/scss/global/variable/fontWeight.scss')}" as *; @use "${path.resolve('./src/styles/scss/global/mixin/layout.scss')}" as *;`,
  },
};

export default nextConfig;
