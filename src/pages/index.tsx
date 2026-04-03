import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ComponentProps } from 'react';
import { HomeTemplate } from '@/components/templates/HomeTemplate/HomeTemplate';
import type { Post } from '@/components/features/post/PostCard/PostCard.types';
import { normalizePosts } from '@/features/post/utils/normalizePost';
import { getPosts } from '@/lib/api/wordpress';

type IndexProps = ComponentProps<typeof HomeTemplate>;

export default function Home({ posts }: IndexProps) {
  return (
    <>
      <Head>
        <title>KatsumaScore</title>
      </Head>
      <HomeTemplate posts={posts} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const currentLocale = locale ?? 'ja';
  const posts = await getPosts({ per_page: 12, lang: currentLocale });
  const normalizedPosts = normalizePosts(posts, currentLocale);
  const templatePosts: Post[] = normalizedPosts.map((post) => ({
    id: String(post.id),
    title: post.title,
    excerpt: post.excerpt,
    slug: post.href,
    image: post.thumbnail || null,
    category: post.category ?? '映画',
    publishedAt: post.publishedAt,
    score: post.score ? Number(post.score) : undefined,
  }));

  return {
    props: { posts: templatePosts },
  };
};
