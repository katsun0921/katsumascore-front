// ISR: revalidate REVALIDATE_NORMAL — 季節レビュー一覧
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { REVALIDATE_NORMAL } from '@/config/revalidate.config';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostCardImgLeft } from '@/components/ui-section/PostCard/PostCardImgLeft';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { getChildPages, normalizePageContent } from '@/libs/api/wordpress';
import {
  resolveSeasonalReviewParentId,
  WORDPRESS_SEASONAL_REVIEWS_PARENT_SLUG_DEFAULT,
} from '@/libs/seasonalReviewParent';
import type { Post } from '@/types/post';

type SeasonalIndexProps = {
  items: Post[];
  locale: string;
};

export const SEASONAL_REVIEWS_BASE_PATH = '/seasonal-reviews';
export const WORDPRESS_SEASONAL_REVIEWS_BASE_PATH = '/seasonal-anime-and-dramas-reviews';
export const WORDPRESS_SEASONAL_REVIEWS_PARENT_SLUG = WORDPRESS_SEASONAL_REVIEWS_PARENT_SLUG_DEFAULT;

const pageSortDate = (page: { modified?: string; date: string }): string => page.modified ?? page.date;

const pageFeaturedImage = (page: unknown): string | null => {
  if (page === null || typeof page !== 'object') return null;
  const embedded = (page as { _embedded?: unknown })._embedded;
  if (embedded === null || typeof embedded !== 'object') return null;
  const featuredMedia = (embedded as { 'wp:featuredmedia'?: unknown })['wp:featuredmedia'];
  if (!Array.isArray(featuredMedia)) return null;
  const firstMedia = featuredMedia[0];
  if (firstMedia === null || typeof firstMedia !== 'object') return null;
  const sourceUrl = (firstMedia as { source_url?: unknown }).source_url;
  return typeof sourceUrl === 'string' ? sourceUrl : null;
};

export { resolveSeasonalReviewParentId };

const SeasonalIndexPage = ({ items, locale }: SeasonalIndexProps) => {
  const loc = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>季節のレビュー | KatsumaScore</title>
        <meta name='description' content='季節ごとのアニメ・ドラマレビュー一覧' />
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-5xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-color-primary'>季節のレビュー</h1>
          {items.length === 0 ? (
            <p className='text-sm text-color-secondary'>現在表示できるページがありません。</p>
          ) : (
            <ul className='grid list-none grid-cols-1 gap-4 p-0 m-0 lg:grid-cols-2'>
              {items.map((item) => (
                <li key={item.id}>
                  <PostCardImgLeft post={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default SeasonalIndexPage;

export const buildSeasonalIndexProps = async (
  locale: string | undefined,
  basePath = SEASONAL_REVIEWS_BASE_PATH,
): Promise<SeasonalIndexProps> => {
  const currentLocale = locale === 'default' ? 'ja' : (locale ?? 'ja');
  const lang = currentLocale === 'en' ? 'en' : 'ja';
  const parentId = await resolveSeasonalReviewParentId();
  let items: Post[] = [];
  if (parentId) {
    items = [...(await getChildPages(parentId))]
      .sort((a, b) => pageSortDate(b).localeCompare(pageSortDate(a)))
      .map((p) => ({
        id: String(p.id),
        slug: `${basePath}/${p.slug}`,
        title: normalizePageContent(p).title,
        excerpt: '',
        image: pageFeaturedImage(p),
        publishedAt: (p.modified ?? p.date).slice(0, 10),
        lang,
      }));
  }

  return { items, locale: currentLocale };
};

export const getStaticProps: GetStaticProps<SeasonalIndexProps> = async ({ locale }) => {
  return {
    props: await buildSeasonalIndexProps(locale),
    revalidate: REVALIDATE_NORMAL,
  };
};
