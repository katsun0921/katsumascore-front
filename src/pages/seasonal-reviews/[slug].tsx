// ISR: revalidate REVALIDATE_HIGH — 季節まとめ（seasonal_review CPT／移行前は固定ページ）
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { REVALIDATE_HIGH } from '@/config/revalidate.config';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { PostContent } from '@/components/ui-section/PostPage/PostContent';
import { SeasonalEntryList, type SeasonalEntryItem } from '@/components/ui-section/SeasonalEntryList';
import { SeasonalWorkExplorer } from '@/components/features/SeasonalWorkExplorer';
import { I18nProvider } from '@/i18n/provider';
import { t, type Locale } from '@/i18n/t';
import { messages } from '@/i18n/seasonalReviewPageMessages';
import {
  getChildPages,
  getPageBySlug,
  getRelatedPosts,
  getSeasonalReviewBySlug,
  getSeasonalReviews,
  normalizePageContent,
  type WPSeasonalReview,
} from '@/libs/api/wordpress';
import { resolveSeasonalReviewParentId } from '@/libs/seasonalReviewParent';
import { normalizeSeasonalReview, type SeasonalEntry } from '@/libs/seasonalReview';
import {
  extractSeasonalWorks,
  normalizeSeasonalWorks,
  type SeasonalWork,
} from '@/libs/seasonalWorks';
import {
  getPostUrl,
  getSeasonalReviewArchivePath,
  getSeasonalReviewUrl,
  resolvePostType,
  normalizeRouteLocale,
} from '@/libs/route';

/** 構造化データの絶対URL組み立てに使うサイトURL。末尾スラッシュは持たせない。 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://katsumascore.blog').replace(/\/$/, '');

/** まとめページ内で区分を並べる順序。見出し文言は SeasonalEntryList 側の i18n が持つ */
const CATEGORY_ORDER: SeasonalEntry['category'][] = ['anime', 'drama', 'movie'];

type SeasonalGroup = {
  category: SeasonalEntry['category'];
  items: SeasonalEntryItem[];
};

type SeasonalDetailProps = {
  title: string;
  /** パンくず・canonical の組み立てに使う。公開URLの末尾セグメント */
  slug: string;
  html: string | null;
  groups: SeasonalGroup[];
  /**
   * 一覧に出す作品リスト。ACF `works` か、移行前の本文 HTML から作る。
   * 1件以上あるときは本文 HTML の代わりに検索・絞り込み付き一覧を出す。
   */
  works: SeasonalWork[];
  locale: string;
};

const SeasonalDetailPage = ({ title, slug, html, groups, works, locale }: SeasonalDetailProps) => {
  const loc = (locale ?? 'ja') as Locale;
  // 作品を抽出できたときは一覧 UI を優先する。抽出できない入稿では従来どおり本文を描画する
  const hasWorks = works.length > 0;

  // パンくずは「ホーム / 季節のレビュー / 記事タイトル」。
  // 旧スラッグ（/seasonal-anime-and-dramas-reviews）配下でも、リンク先は
  // 移行後の正のパス（/seasonal-reviews）へ寄せる
  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], loc), href: '/' },
    {
      label: t(messages, ['breadcrumb', 'seasonalReview'], loc),
      href: getSeasonalReviewArchivePath(loc),
    },
    { label: title },
  ];

  const canonicalUrl = `${SITE_URL}${getSeasonalReviewUrl(slug, loc)}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href === '/' ? '' : item.href}` : canonicalUrl,
    })),
  };

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{title} | KatsumaScore</title>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </Head>
      <PageLayout>
        <div className='px-4 pt-3 pb-0'>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className={`px-4 py-8 mx-auto ${hasWorks ? 'max-w-5xl' : 'max-w-3xl'}`}>
          <h1 className='text-2xl font-bold mb-6 text-color-primary'>{title}</h1>
          {hasWorks ? <SeasonalWorkExplorer works={works} /> : null}
          {!hasWorks && html ? <PostContent content={html} /> : null}
          {groups.map((group) => (
            <SeasonalEntryList key={group.category} category={group.category} items={group.items} />
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

/**
 * 一覧に出す作品リストを決める。
 *
 * ACF `works` が入稿済みならそれを正とし、まだ空のハブでは移行前の
 * 本文 HTML から拾う。どちらも同じ `SeasonalWork` を返すため、
 * 描画側（`SeasonalWorkExplorer`）は出どころを意識しない。
 */
const resolveWorks = (review: WPSeasonalReview, html: string | null): SeasonalWork[] => {
  const fromAcf = normalizeSeasonalWorks(review.acf?.works);
  if (fromAcf.length > 0) return fromAcf;
  return extractSeasonalWorks(html ?? '');
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
    const groups = await buildGroups(normalized.entries, lang);
    return {
      props: {
        title: normalized.title,
        slug,
        html: normalized.html,
        groups,
        // データの優先順位:
        //   1. ACF entries（鑑賞後のレビューまとめ）→ SeasonalEntryList で描画
        //   2. ACF works（今クールのラインナップ）→ SeasonalWorkExplorer で描画
        //   3. 本文 HTML のパース → 同上（ACF がまだ空のハブ向け）
        works: groups.length > 0 ? [] : resolveWorks(review, normalized.html),
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
      slug,
      html: normalized.html,
      groups: [],
      works: extractSeasonalWorks(normalized.html ?? ''),
      locale: currentLocale,
    },
    revalidate: REVALIDATE_HIGH,
  };
};
