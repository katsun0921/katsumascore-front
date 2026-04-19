import Head from 'next/head';
import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { ListTemplate } from '@/components/templates/ListTemplate';
import { normalizePosts } from '@/lib/utils/normalizePost';
import { getCategories, getPostsByCategory } from '@/lib/api/wordpress';
import type { Post } from '@/types/post';

const FILTER_OPTIONS = [
  { label: '評価順', value: 'score' },
  { label: '新着', value: 'new' },
  { label: '配信中', value: 'streaming' },
];

type CategoryPageProps = {
  categoryName: string;
  posts: Post[];
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

const CategoryPage = ({ categoryName, posts }: CategoryPageProps) => {
  const [activeFilter, setActiveFilter] = useState('score');

  const sortedPosts = sortPosts(posts, activeFilter);

  return (
    <>
      <Head>
        <title>{categoryName} | KatsumaScore</title>
        <meta name='description' content={`${categoryName}の記事一覧 — スコアで選ぶ`} />
      </Head>
      <ListTemplate
        categoryName={categoryName}
        categoryDescription={`今観るべき${categoryName}作品を、スコアで選ぶ`}
        posts={sortedPosts}
        filterOptions={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterSelect={setActiveFilter}
      />
    </>
  );
};

export default CategoryPage;

export const getStaticPaths: GetStaticPaths = async ({ locales = ['ja'] }) => {
  const paths = [];

  for (const locale of locales) {
    const categories = await getCategories(locale);
    for (const category of categories) {
      paths.push({ params: { slug: category.slug }, locale });
    }
  }

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const currentLocale = locale ?? 'ja';
  const slug = params?.slug as string;

  const categories = await getCategories(currentLocale);
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { notFound: true };
  }

  const wpPosts = await getPostsByCategory(category.id, currentLocale);
  const posts = normalizePosts(wpPosts, currentLocale);

  return {
    props: {
      categoryName: category.name,
      posts,
    },
    revalidate: 60,
  };
};
