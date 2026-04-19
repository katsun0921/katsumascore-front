import Link from 'next/link';
import { PostCardMedia } from '@/components/ui-parts/PostCard/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCard/PostCardBody';
import type { Post } from '@/types/post';
import './PostCardOverlay.scss';

type Props = {
  post: Post;
  className?: string;
};

export const PostCardOverlay = ({ post, className }: Props) => {
  const classes = ['postCardOverlay', className].filter(Boolean).join(' ');
  return (
    <article className={classes}>
      <Link href={post.slug} className='postCardOverlay__link'>
        <PostCardMedia image={post.image} title={post.title} />
        <PostCardBody
          publishedAt={post.publishedAt}
          title={post.title}
          excerpt={post.excerpt}
        />
      </Link>
    </article>
  );
};
