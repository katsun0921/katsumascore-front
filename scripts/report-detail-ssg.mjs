/** 生成マニフェストから詳細ページの実数を報告する。トークン登録後は不完全な生成をデプロイ前に中止する。 */
import { readFileSync, writeFileSync } from 'node:fs';

const detailRoutes = new Set([
  '/[slug]', '/movie/[slug]', '/anime/[slug]', '/drama/[slug]', '/person/[slug]',
  '/company/[slug]', '/franchise/[slug]', '/seasonal-reviews/[slug]',
  '/seasonal-anime-and-dramas-reviews/[slug]', '/theater-release/[slug]', '/vod-release/[slug]',
]);

export const reportDetailSsg = (durationSeconds) => {
  const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'));
  const strict = Boolean(process.env.WP_BUILD_TOKEN?.trim());
  const missing = new Set(manifest.notFoundRoutes);
  const countsByLocale = Object.fromEntries([...detailRoutes].map((route) => [route, { ja: 0, en: 0, default: 0 }]));
  const counts = Object.fromEntries([...detailRoutes].map((route) => [route, 0]));
  for (const [route, entry] of Object.entries(manifest.routes)) {
    if (!detailRoutes.has(entry.srcRoute)) continue;
    if (missing.has(route)) {
      if (strict) throw new Error(`Detail SSG failed: ${route}`);
      console.warn(`[detail-ssg] WP_BUILD_TOKEN未設定: 未生成の詳細を集計から除外: ${route}`);
      continue;
    }
    if (entry.initialRevalidateSeconds !== false) {
      throw new Error(`Detail SSG failed or is still ISR: ${route}`);
    }
    counts[entry.srcRoute] += 1;
    const segment = route.split('/')[1];
    const locale = segment === 'ja' || segment === 'en' ? segment : 'default';
    countsByLocale[entry.srcRoute][locale] += 1;
  }
  for (const route of detailRoutes) {
    if (manifest.dynamicRoutes[route]?.fallback !== null) throw new Error(`Detail fallback is not blocking: ${route}`);
  }
  const report = { generatedAt: new Date().toISOString(), durationSeconds, total: Object.values(counts).reduce((a, b) => a + b, 0), counts, countsByLocale };
  writeFileSync('.next/ssg-detail-report.json', JSON.stringify(report, null, 2));
  console.log('[detail-ssg] generated pages:', JSON.stringify(report));
  return report;
};
