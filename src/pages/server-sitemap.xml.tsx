// SSR: WPデータを含む XML sitemap をリクエスト時に生成。Cache-Control でエッジキャッシュに乗せる
import type { GetServerSideProps } from 'next';
import {
  getPostsPagedMerge,
  mapWPPostToPost,
  getGenres,
  getTags,
  getAllFranchiseSlugs,
  getChildPages,
  getPersons,
  getVodReleases,
  getTheaterReleases,
} from '@/libs/api/wordpress';
import { resolveSeasonalReviewParentId } from '@/libs/seasonalReviewParent';
import type { PostType } from '@/libs/route';
import {
  getPostTypeArchivePath,
  getTaxonomyUrl,
  getEntityUrl,
  getVodHubPath,
  getVodArchivePath,
  getVodReleaseArchivePath,
  getVodReleaseUrl,
  getTheaterReleaseArchivePath,
  getTheaterReleaseUrl,
} from '@/libs/route';
import { VOD_ARCHIVE_PATH_SLUGS } from '@/libs/vodPathToWpSlug';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

const LOCALES = ['ja', 'en'] as const;
const POST_TYPES: PostType[] = ['movie', 'anime', 'drama'];

// 100件/ページ × 10ページ = 最大1000記事までサイトマップに載せる
const SITEMAP_POSTS_MAX_PAGES = 10;

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

  const [wpPosts, genres, tags, franchiseSlugs, seasonal, persons, vodReleases, theaterReleases] =
    await Promise.all([
      getPostsPagedMerge({ per_page: 100 }, SITEMAP_POSTS_MAX_PAGES),
      getGenres(),
      getTags(),
      getAllFranchiseSlugs(),
      seasonalParentId ? getChildPages(seasonalParentId) : Promise.resolve([]),
      getPersons(100),
      getVodReleases(100),
      getTheaterReleases(100),
    ]);

  const staticPaths: SitemapItem[] = LOCALES.flatMap((lang) => [
    { loc: `${SITE_URL}/${lang}`, changefreq: 'daily', priority: 1 },
    { loc: `${SITE_URL}/${lang}/featured`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/${lang}/seasonal-reviews`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_URL}/${lang}/about`, changefreq: 'monthly', priority: 0.3 },
    { loc: `${SITE_URL}/${lang}/contact`, changefreq: 'monthly', priority: 0.3 },
    { loc: `${SITE_URL}/${lang}/privacy-policy`, changefreq: 'monthly', priority: 0.3 },
  ]);

  // 記事詳細: mapWPPostToPost の slug はロケール込みのフルパス（例: /ja/movie/inception-2010）。
  // 記事は ACF lang により ja / en いずれか一方の URL でのみ列挙する
  const postItems: SitemapItem[] = wpPosts.flatMap((wp) => {
    const post = mapWPPostToPost(wp);
    if (!post) return [];
    const raw = wp as { date?: string; modified?: string };
    const lastmod = raw.modified ?? raw.date;
    return [
      {
        loc: `${SITE_URL}${post.slug}`,
        ...(lastmod !== undefined ? { lastmod: new Date(lastmod).toISOString() } : {}),
        changefreq: 'monthly',
        priority: 0.7,
      },
    ];
  });

  // 記事一覧・VOD・タクソノミーのアーカイブページ（ja / en 両方）
  const archiveItems: SitemapItem[] = LOCALES.flatMap((lang) => [
    ...POST_TYPES.map((type) => ({
      loc: `${SITE_URL}${getPostTypeArchivePath({ type, lang })}`,
      changefreq: 'daily',
      priority: 0.8,
    })),
    { loc: `${SITE_URL}${getVodHubPath(lang)}`, changefreq: 'weekly', priority: 0.6 },
    ...VOD_ARCHIVE_PATH_SLUGS.map((slug) => ({
      loc: `${SITE_URL}${getVodArchivePath(slug, lang)}`,
      changefreq: 'daily',
      priority: 0.6,
    })),
    ...genres.map((g) => ({
      loc: `${SITE_URL}${getTaxonomyUrl('genre', g.slug, lang)}`,
      changefreq: 'weekly',
      priority: 0.5,
    })),
    ...tags.map((tag) => ({
      loc: `${SITE_URL}${getTaxonomyUrl('tag', tag.slug, lang)}`,
      changefreq: 'weekly',
      priority: 0.4,
    })),
    ...franchiseSlugs.map((slug) => ({
      loc: `${SITE_URL}${getTaxonomyUrl('franchise', slug, lang)}`,
      changefreq: 'weekly',
      priority: 0.5,
    })),
    ...persons.map((p) => ({
      loc: `${SITE_URL}${getEntityUrl('person', p.slug, lang)}`,
      changefreq: 'monthly',
      priority: 0.5,
    })),
    ...seasonal.map((p) => ({
      loc: `${SITE_URL}/${lang}/seasonal-reviews/${p.slug}`,
      lastmod: new Date(p.modified ?? p.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.55,
    })),
  ]);

  // VOD配信情報・劇場公開情報は日本語記事のみのため、canonical と同じく ja のみ列挙する
  const releaseItems: SitemapItem[] = [
    { loc: `${SITE_URL}${getVodReleaseArchivePath('ja')}`, changefreq: 'weekly', priority: 0.6 },
    ...vodReleases.map((release) => ({
      loc: `${SITE_URL}${getVodReleaseUrl(release.slug, 'ja')}`,
      lastmod: new Date(release.modified ?? release.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.5,
    })),
    { loc: `${SITE_URL}${getTheaterReleaseArchivePath('ja')}`, changefreq: 'weekly', priority: 0.6 },
    ...theaterReleases.map((release) => ({
      loc: `${SITE_URL}${getTheaterReleaseUrl(release.slug, 'ja')}`,
      lastmod: new Date(release.modified ?? release.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.5,
    })),
  ];

  const fields: SitemapItem[] = [...staticPaths, ...postItems, ...archiveItems, ...releaseItems];

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
