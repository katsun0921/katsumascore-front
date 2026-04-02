import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { PostTopImage } from '@/features/post/components/PostTopImage';
import type { PostCardData } from '@/features/post/types/PostCard';
import { normalizePosts } from '@/features/post/utils/normalizePost';
import { getPosts } from '@/lib/api/wordpress';

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
          <p>記事が見つかりませんでした</p>
        ) : (
          <div>
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
  const normalizedPosts = normalizePosts(posts, currentLocale);

  return {
    props: { posts: normalizedPosts },
  };
};
