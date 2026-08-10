// SSR: WPデータを含む XML sitemap をリクエスト時に生成。Cache-Control でエッジキャッシュに乗せる
import type { GetServerSideProps } from 'next';
import {
  getSitemapPosts,
  getCategories,
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
  getPostUrl,
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

// WP カテゴリスラッグ → PostType。ここに無いカテゴリの記事はサイトマップから除外する
// （route.ts の resolvePostType は未知スラッグを 'movie' にフォールバックするため、
//   誤った URL が静かに混入しないよう独自に解決する）
const CATEGORY_SLUG_TO_POST_TYPE: Partial<Record<string, PostType>> = {
  movie: 'movie',
  anime: 'anime',
  drama: 'drama',
};

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

  const [wpPosts, categories, genres, tags, franchiseSlugs, seasonal, persons, vodReleases, theaterReleases] =
    await Promise.all([
      getSitemapPosts(100, SITEMAP_POSTS_MAX_PAGES),
      getCategories(),
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

  // WP 取得自体に失敗した場合は、記事が存在しないサイトマップを 200 で返さない。
  // 空のサイトマップを返すとクローラーに「記事が消えた」と伝わるため 503 で一時的失敗を示す
  if (wpPosts === null) {
    console.error('[server-sitemap] WP からの記事取得に失敗したため 503 を返す');
    res.statusCode = 503;
    res.setHeader('Cache-Control', 'no-store');
    res.end();
    return { props: {} };
  }

  // カテゴリ ID → PostType。`_embed` を使わないため ID から解決する
  const postTypeByCategoryId = new Map<number, PostType>(
    categories.flatMap((c) => {
      const type = CATEGORY_SLUG_TO_POST_TYPE[c.slug];
      return type ? ([[c.id, type]] as [number, PostType][]) : [];
    })
  );

  // 記事詳細URL（例: /ja/movie/inception-2010）。
  // 記事は ACF lang により ja / en いずれか一方の URL でのみ列挙する
  const postItems: SitemapItem[] = wpPosts.flatMap((wp) => {
    // movie / anime / drama 以外のカテゴリ（未分類等）はページが存在しないため除外する
    const type = (wp.categories ?? []).map((id) => postTypeByCategoryId.get(id)).find((t) => t !== undefined);
    if (!type) return [];
    const lang = wp.acf?.lang === 'en' ? 'en' : 'ja';
    const lastmod = wp.modified ?? wp.date;
    return [
      {
        loc: `${SITE_URL}${getPostUrl(type, wp.slug, lang)}`,
        ...(lastmod !== undefined ? { lastmod: new Date(lastmod).toISOString() } : {}),
        changefreq: 'monthly',
        priority: 0.7,
      },
    ];
  });

  // 取得は成功したが記事 URL が 1 件も組み立てられなかった場合も異常として扱う
  if (postItems.length === 0) {
    console.error(`[server-sitemap] 記事URLが0件（取得件数: ${wpPosts.length}）。カテゴリ解決を確認すること`);
    res.statusCode = 503;
    res.setHeader('Cache-Control', 'no-store');
    res.end();
    return { props: {} };
  }

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
