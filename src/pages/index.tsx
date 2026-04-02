import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { PostTopImage } from '@/features/post/components/PostTopImage';
import type { PostCardData } from '@/features/post/types/PostCard';
import { getPosts, normalizePost } from '@/lib/api/wordpress';

type IndexProps = {
  posts: PostCardData[];
};

export default function Home({ posts }: IndexProps) {
  return (
    <>
      <Head>
        <title>KatsumaScore</title>
      </Head>
      <PageLayout>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-16">記事が見つかりませんでした</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostTopImage key={post.id} post={post} />
            ))}
          </div>
        )}
      </PageLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const currentLocale = locale ?? 'ja';
  const posts = await getPosts({ per_page: 12, lang: currentLocale });
  const normalizedPosts = posts.map((post) => normalizePost(post, currentLocale));

  return {
    props: { posts: normalizedPosts },
  };
};
