import type { GetServerSideProps } from 'next';
import { getPostBySlug, mapWPPostToPost } from '@/lib/api/wordpress';
import { PostDetail } from '@/components/features/post/PostDetail/PostDetail';
import { PostSEO } from '@/components/features/post/PostSEO/PostSEO';
import type { PostDetailProps } from '@/components/features/post/PostDetail/PostDetail.types';

type Props = {
  post: PostDetailProps['post'];
  locale: string;
};

export default function PostPage({ post, locale }: Props) {
  return (
    <>
      <PostSEO post={post} locale={locale} />
      <PostDetail post={post} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const wpPost = await getPostBySlug(slug, locale);
  if (!wpPost) return { notFound: true };

  return {
    props: {
      post: mapWPPostToPost(wpPost),
      locale: locale ?? 'ja',
    },
  };
};
