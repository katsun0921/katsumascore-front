/**
 * SSG 凍結ビルド用に sitemap.xml / server-sitemap.xml をビルド時に生成し、public/ へ書き出す。
 * `NEXT_PUBLIC_SSG_FREEZE=1` のときだけ動作し、それ以外は何もしない（通常ビルドは SSR ページ相当ではなくこのスクリプトに一本化している）。
 * WP からの取得は wpFetchGuard（同時実行制限・再試行・失敗時ビルド中止）を通す。
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

if (process.env.NEXT_PUBLIC_SSG_FREEZE !== '1') {
  console.log('[generate-sitemaps] NEXT_PUBLIC_SSG_FREEZE が未設定のためスキップします');
  process.exit(0);
}

// wpFetchGuard はビルドフェーズでのみ有効なため、スクリプトでもビルドフェーズとして扱う
process.env.NEXT_PHASE = 'phase-production-build';

const { buildServerSitemapXml, buildStaticSitemapXml } = await import('../src/libs/sitemap/buildSitemaps');

const publicDir = path.resolve(process.cwd(), 'public');
const serverXml = await buildServerSitemapXml();
await writeFile(path.join(publicDir, 'server-sitemap.xml'), serverXml, 'utf8');
await writeFile(path.join(publicDir, 'sitemap.xml'), buildStaticSitemapXml(), 'utf8');

const urlCount = (serverXml.match(/<url>/g) ?? []).length;
console.log(`[generate-sitemaps] server-sitemap.xml: ${urlCount} URLs`);
