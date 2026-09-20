// ISR: revalidate REVALIDATE_HIGH — 季節まとめ（seasonal_review CPT／移行前は固定ページ）
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { REVALIDATE_HIGH } from '@/config/revalidate.config';
import { PageLayout } from '@/components/templates/PageLayout';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { SeasonalEntryList, type SeasonalEntryItem } from '@/components/ui-section/SeasonalEntryList';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import {
  getChildPages,
  getPageBySlug,
  getRelatedPosts,
  getSeasonalReviewBySlug,
  getSeasonalReviews,
  normalizePageContent,
} from '@/libs/api/wordpress';
import { resolveSeasonalReviewParentId } from '@/libs/seasonalReviewParent';
import { normalizeSeasonalReview, type SeasonalEntry } from '@/libs/seasonalReview';
import { getPostUrl, resolvePostType, normalizeRouteLocale } from '@/libs/route';

/** 区分ごとの見出し。`SeasonalEntry['category']` と対応する */
const CATEGORY_HEADINGS: Record<SeasonalEntry['category'], string> = {
  anime: 'アニメ',
  drama: 'ドラマ',
  movie: '映画',
};

const CATEGORY_ORDER: SeasonalEntry['category'][] = ['anime', 'drama', 'movie'];

type SeasonalGroup = {
  category: SeasonalEntry['category'];
  heading: string;
  items: SeasonalEntryItem[];
};

type SeasonalDetailProps = {
  title: string;
  html: string | null;
  groups: SeasonalGroup[];
  locale: string;
};

const SeasonalDetailPage = ({ title, html, groups, locale }: SeasonalDetailProps) => {
  const loc = (locale ?? 'ja') as Locale;
  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{title} | KatsumaScore</title>
      </Head>
      <PageLayout>
        <div className='px-4 py-8 max-w-3xl mx-auto'>
          <h1 className='text-2xl font-bold mb-6 text-color-primary'>{title}</h1>
          {html ? <PostContent content={html} /> : null}
          {groups.map((group) => (
            <SeasonalEntryList key={group.category} heading={group.heading} items={group.items} />
          ))}
        </div>
      </PageLayout>
    </I18nProvider>
  );
};

export default SeasonalDetailPage;

/**
 * `entries` の各作品について、個別記事へのパスを解決する。
 *
 * カテゴリー（movie / anime / drama）で URL 基底が変わるため、
 * 投稿を一括取得して `_embedded` のカテゴリーから組み立てる。
 */
const buildGroups = async (
  entries: SeasonalEntry[],
  lang: 'ja' | 'en',
): Promise<SeasonalGroup[]> => {
  const ids = entries.map((e) => e.postId);
  const posts = ids.length > 0 ? await getRelatedPosts(ids) : [];

  const hrefById = new Map<number, string>();
  const titleById = new Map<number, string>();
  for (const post of posts) {
    const terms = post._embedded?.['wp:term'];
    const categories = Array.isArray(terms) ? terms[0] : undefined;
    const type = resolvePostType(categories?.[0]?.slug);
    hrefById.set(post.id, getPostUrl(type, post.slug, lang));
    titleById.set(post.id, post.title?.rendered ?? '');
  }

  return CATEGORY_ORDER.map((category) => ({
    category,
    heading: CATEGORY_HEADINGS[category],
    items: entries
      .filter((e) => e.category === category)
      .map((e) => ({
        postId: e.postId,
        title: titleById.get(e.postId) || e.title,
        memo: e.memo,
        href: hrefById.get(e.postId) ?? null,
      })),
  })).filter((group) => group.items.length > 0);
};

export const getStaticPaths: GetStaticPaths = async ({ locales = ['ja'] }) => {
  const paths: { params: { slug: string }; locale: string }[] = [];
  const reviews = await getSeasonalReviews();
  // CPT がまだ空のあいだは移行前の固定ページからパスを組み立てる
  const slugs =
    reviews.length > 0
      ? reviews.map((r) => r.slug)
      : await (async () => {
          const parentId = await resolveSeasonalReviewParentId();
          if (!parentId) return [];
          return (await getChildPages(parentId)).map((p) => p.slug);
        })();

  for (const loc of locales.filter((l) => l !== 'default')) {
    for (const slug of slugs) {
      paths.push({ params: { slug }, locale: loc });
    }
  }
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<SeasonalDetailProps> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };
  const currentLocale = locale === 'default' ? 'ja' : (locale ?? 'ja');
  const lang = normalizeRouteLocale(currentLocale);

  // CPT を優先し、見つからなければ移行前の固定ページへフォールバックする。
  // 公開URLが移行前後で同一のため、切り替え中も404にならない。
  const review = await getSeasonalReviewBySlug(slug);
  if (review) {
    const normalized = normalizeSeasonalReview(review);
    return {
      props: {
        title: normalized.title,
        html: normalized.html,
        groups: await buildGroups(normalized.entries, lang),
        locale: currentLocale,
      },
      revalidate: REVALIDATE_HIGH,
    };
  }

  const page = await getPageBySlug(slug);
  if (!page) return { notFound: true };
  const normalized = normalizePageContent(page);

  return {
    props: {
      title: normalized.title,
      html: normalized.html,
      groups: [],
      locale: currentLocale,
    },
    revalidate: REVALIDATE_HIGH,
  };
};
