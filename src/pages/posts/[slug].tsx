import type { GetServerSideProps } from 'next';
import { getPostBySlug, mapWPPostToPost } from '@/lib/api/wordpress';
import { PostDetail } from '@/components/features/post/PostDetail/PostDetail';
import type { PostDetailProps } from '@/components/features/post/PostDetail/PostDetail.types';

type Props = {
  post: PostDetailProps['post'];
};

export default function PostPage({ post }: Props) {
  return <PostDetail post={post} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (typeof slug !== 'string') return { notFound: true };

  const wpPost = await getPostBySlug(slug, locale);
  if (!wpPost) return { notFound: true };

  return {
    props: {
      post: mapWPPostToPost(wpPost),
    },
  };
};
