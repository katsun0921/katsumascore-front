import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ComponentProps } from 'react';
import { HomeTemplate } from '@/components/templates/HomeTemplate/HomeTemplate';
import { normalizePosts } from '@/components/features/post/utils/normalizePost';
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

  return {
    props: { posts: normalizedPosts },
  };
};
