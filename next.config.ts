import type { NextConfig } from "next";
import path from "path";
import { NORMALIZE_VERSION } from './src/libs/cache/version'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.katsumascore.blog',
        pathname: '/wp-content/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // ローカル開発環境では cms.katsumascore.blog が NAT64 プライベートIPに解決されるため
    // Next.js の画像最適化をバイパスして直接 URL を使用する
    unoptimized: process.env.NODE_ENV === 'development',
    // CDN / ISR と整合しやすい TTL（秒）。要件に合わせて調整可
    minimumCacheTTL: 60,
  },
  i18n: {
    locales: ['default', 'ja', 'en'],
    defaultLocale: 'default',
    localeDetection: false,
  },
  async headers() {
    // Cache-Control 設計（設計書 ④ に準拠）
    // ISR revalidate と s-maxage を揃えることで Next ↔ Edge の二重 TTL を整合させる。
    // stale-while-revalidate により期限切れ時も旧版を即返しつつ裏で更新する。
    return [
      // 全ページ共通: normalize バージョンを付与（Cloudflare Cache Key 用）
      {
        source: '/(.*)',
        headers: [{ key: 'x-normalize-version', value: NORMALIZE_VERSION }],
      },
      // 記事詳細ページ（ISR 300s に対応）
      {
        source: '/:locale(ja|en)/:type(anime|drama|movie)/:slug',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }],
      },
      {
        source: '/:type(anime|drama|movie)/:slug',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }],
      },
      // 季節レビュー詳細・actor詳細（記事相当）
      {
        source: '/:locale(ja|en)?/seasonal-reviews/:slug',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }],
      },
      {
        source: '/actor/:slug',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }],
      },
      // TOP ページ（ISR 300s に対応）
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' }],
      },
      {
        source: '/:locale(ja|en)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' }],
      },
      // カテゴリ一覧・VOD 一覧（ISR 600s に対応）
      {
        source: '/:locale(ja|en)?/:type(anime|drama|movie|vod)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      {
        source: '/:locale(ja|en)?/:type(anime|drama|movie)/page/:page',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      {
        source: '/:locale(ja|en)?/vod/:slug',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      {
        source: '/:locale(ja|en)?/vod/:slug/page/:page',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      {
        source: '/:locale(ja|en)?/genre/:slug',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      {
        source: '/:locale(ja|en)?/genre/:slug/p/:page',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      {
        source: '/:locale(ja|en)?/seasonal-reviews',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      {
        source: '/featured',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      // RSS / sitemap（SSR で個別に設定済みだが念のため統一）
      {
        source: '/:file(sitemap.xml|feed)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=1800' }],
      },
      // 検索結果ページシェル（SSG シェル自体はキャッシュ可だが API レスポンスは private）
      {
        source: '/search',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=600, stale-while-revalidate=1800' }],
      },
      // プレビュー（Cookie 認証が必要なためキャッシュ禁止）
      {
        source: '/api/preview(.*)',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
    ]
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
