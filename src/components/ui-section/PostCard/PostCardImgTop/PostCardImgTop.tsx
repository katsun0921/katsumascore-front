import type { ReactNode } from 'react';
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
  priority?: boolean;
  /** カードの右上に重ねる操作（例：サヨの「要約」ボタン）。リンクの「隣」に置く */
  action?: ReactNode;
  /** タイトル直下に添える補足キャプション（例: Person詳細ページの出演役名） */
  caption?: string;
};

export const PostCardImgTop = ({ post, rank, className, priority, caption, action }: Props) => (
  <PostCardContainer className={['relative', className].filter(Boolean).join(' ')} dataComponent='PostCardImgTop'>
    <Link href={post.slug} locale={linkLocaleForHref(post.slug)} className='relative grid text-inherit'>
      {rank !== undefined && <PostCardRankBadge rank={rank} />}
      <PostCardMedia image={post.image} title={post.title} className='aspect-video w-full' priority={priority} />
      <PostCardBody
        publishedAt={post.publishedAt}
        title={post.title}
        excerpt={post.excerpt}
        caption={caption}
      />
    </Link>
    {action && <div className='absolute right-2 top-2 z-10'>{action}</div>}
  </PostCardContainer>
);
