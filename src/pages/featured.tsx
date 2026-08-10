// ISR: revalidate REVALIDATE_NORMAL — 特集カテゴリ一覧
import Head from 'next/head';
import { useState } from 'react';
import type { GetStaticProps } from 'next';
import { REVALIDATE_NORMAL } from '@/config/revalidate.config';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { I18nProvider } from '@/i18n/provider';
import type { Locale } from '@/i18n/t';
import { WP_FEATURED_CATEGORY_SLUG } from '@/config/wpContent.config';
import { getCategoryBySlug, getPostsWithMeta } from '@/libs/api/wordpress';
import { normalizePosts } from '@/utils/normalizePost';
import type { Post } from '@/types/post';
/** per_page=100 は `_embed` 込みで約7MB・コールド約6〜7秒かかるため、既定3秒を上書きする */
const FEATURED_FETCH_OPTIONS = { timeoutMs: 15_000, maxRetries: 1 } as const;

const FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

type FeaturedPageProps = {
  categoryName: string;
  posts: Post[];
  locale: string;
};

const sortPosts = (posts: Post[], filter: string): Post[] => {
  if (filter === 'score') {
    return [...posts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }
  if (filter === 'new') {
    return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
  return posts;
};

const FeaturedPage = ({ categoryName, posts, locale }: FeaturedPageProps) => {
  const [activeFilter, setActiveFilter] = useState('score');
  const sortedPosts = sortPosts(posts, activeFilter);
  const loc = (locale ?? 'ja') as Locale;

  return (
    <I18nProvider locale={loc}>
      <Head>
        <title>{categoryName} | KatsumaScore</title>
        <meta name='description' content={`${categoryName}の記事一覧`} />
      </Head>
      <ListTemplate
        categoryName={categoryName}
        categoryDescription={categoryName}
        posts={sortedPosts}
        filterOptions={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterSelect={setActiveFilter}
        currentPage={1}
        totalPages={1}
      />
    </I18nProvider>
  );
};

export default FeaturedPage;

export const getStaticProps: GetStaticProps<FeaturedPageProps> = async ({ locale }) => {
  const currentLocale = (locale === 'en' ? 'en' : 'ja') as import('@/libs/api/wordpress/lang').Locale;
  const slug = WP_FEATURED_CATEGORY_SLUG;
  const category = await getCategoryBySlug(slug, FEATURED_FETCH_OPTIONS);

  // WP 側に `featured` カテゴリが存在しない場合もここに入る。
  // 取得失敗と設定不備を切り分けられるようログを残す（現状 WP には movie / anime / drama のみ）
  if (!category) {
    console.error(`[featured] カテゴリ "${slug}" を WP から解決できないため 404 を返す`);
    return { notFound: true };
  }

  const fetched = await getPostsWithMeta(
    {
      category: category.id,
      page: 1,
      per_page: 100,
    },
    FEATURED_FETCH_OPTIONS,
  );

  // 取得失敗を notFound（404）にすると、WP の一時的な不調で特集ページが
  // 検索エンジンから消える。throw して ISR に前回の生成結果を維持させる
  if (!fetched) {
    throw new Error('[featured] WP から特集記事を取得できなかったため ISR の再生成を中止する');
  }

  return {
    props: {
      categoryName: category.name,
      posts: normalizePosts(fetched.items, currentLocale),
      locale: currentLocale,
    },
    revalidate: REVALIDATE_NORMAL,
  };
};
