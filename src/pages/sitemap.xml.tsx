// SSR: XML sitemap をリクエスト時に生成
import type { GetServerSideProps } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

const escapeXml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const staticPaths = [
    { loc: `${SITE_URL}/ja`, changefreq: 'daily', priority: 1 },
    { loc: `${SITE_URL}/en`, changefreq: 'daily', priority: 1 },
    { loc: `${SITE_URL}/ja/featured`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/en/featured`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/ja/seasonal-reviews`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_URL}/en/seasonal-reviews`, changefreq: 'weekly', priority: 0.6 },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths.map((path) => `  <url>
    <loc>${escapeXml(path.loc)}</loc>
    <changefreq>${path.changefreq}</changefreq>
    <priority>${path.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return { props: {} };
};

const Sitemap = () => null;

export default Sitemap;
