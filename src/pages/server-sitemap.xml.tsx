// SSR: WPデータを含む XML sitemap をリクエスト時に生成。Cache-Control でエッジキャッシュに乗せる
import type { GetServerSideProps } from 'next';
import { getPosts, getCategoriesForArchiveResolve, getChildPages, getPersons } from '@/libs/api/wordpress';
import { resolveSeasonalReviewParentId } from '@/libs/seasonalReviewParent';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

type SitemapItem = {
  loc: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
};

const escapeXml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const seasonalParentId = await resolveSeasonalReviewParentId();

  const [posts, categories, seasonal, persons] = await Promise.all([
    getPosts({ per_page: 100 }),
    getCategoriesForArchiveResolve(),
    seasonalParentId ? getChildPages(seasonalParentId) : Promise.resolve([]),
    getPersons(100),
  ]);

  const staticPaths: SitemapItem[] = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: 1 },
    { loc: `${SITE_URL}/en`, changefreq: 'daily', priority: 1 },
    { loc: `${SITE_URL}/top`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_URL}/en/top`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_URL}/featured`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/en/featured`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/seasonal-reviews`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_URL}/en/seasonal-reviews`, changefreq: 'weekly', priority: 0.6 },
  ];

  const fields: SitemapItem[] = [
    ...staticPaths,
    ...posts.map((post) => ({
      loc: `${SITE_URL}/posts/${post.slug}`,
      lastmod: new Date(post.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      loc: `${SITE_URL}/en/posts/${post.slug}`,
      lastmod: new Date(post.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.7,
    })),
    ...categories.map((cat) => ({
      loc: `${SITE_URL}/categories/${cat.slug}`,
      changefreq: 'weekly',
      priority: 0.5,
    })),
    ...categories.map((cat) => ({
      loc: `${SITE_URL}/en/categories/${cat.slug}`,
      changefreq: 'weekly',
      priority: 0.5,
    })),
    ...seasonal.map((p) => ({
      loc: `${SITE_URL}/seasonal-reviews/${p.slug}`,
      lastmod: new Date(p.modified ?? p.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.55,
    })),
    ...seasonal.map((p) => ({
      loc: `${SITE_URL}/en/seasonal-reviews/${p.slug}`,
      lastmod: new Date(p.modified ?? p.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.55,
    })),
    ...persons.map((p) => ({
      loc: `${SITE_URL}/person/${p.acf.slug ?? p.slug}`,
      changefreq: 'monthly',
      priority: 0.5,
    })),
    ...persons.map((p) => ({
      loc: `${SITE_URL}/en/person/${p.acf.slug ?? p.slug}`,
      changefreq: 'monthly',
      priority: 0.5,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fields
  .map(
    (field) => `  <url>
    <loc>${escapeXml(field.loc)}</loc>
${field.lastmod ? `    <lastmod>${field.lastmod}</lastmod>` : ''}
    <changefreq>${field.changefreq}</changefreq>
    <priority>${field.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  // 24時間エッジキャッシュ。Cloudflare が初回リクエスト後はキャッシュから返すため Workers の CPU 制限を回避できる
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return { props: {} };
};

const ServerSitemap = () => null;

export default ServerSitemap;
