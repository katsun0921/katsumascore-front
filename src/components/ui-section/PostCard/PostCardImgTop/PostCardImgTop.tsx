import Link from 'next/link';
import { linkLocaleForHref } from '@/libs/nextLinkLocale';
import { PostCardContainer } from '@/components/ui-parts/PostCard/PostCardContainer';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import { PostCardRankBadge } from '@/components/ui-parts/PostCard/PostCardRankBadge';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
  rank?: number;
  className?: string;
};

export const PostCardImgTop = ({ post, rank, className }: Props) => (
  <PostCardContainer className={className}>
    <Link href={post.slug} locale={linkLocaleForHref(post.slug)} className='relative grid text-inherit'>
      {rank !== undefined && <PostCardRankBadge rank={rank} />}
      <PostCardMedia image={post.image} title={post.title} className='aspect-video w-full' />
      <PostCardBody
        publishedAt={post.publishedAt}
        title={post.title}
        excerpt={post.excerpt}
      />
    </Link>
  </PostCardContainer>
);
