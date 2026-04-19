import Link from 'next/link';
import { PostCardMedia } from '@/components/ui-parts/PostCardMedia';
import { PostCardBody } from '@/components/ui-parts/PostCardBody';
import type { Post } from '@/types/post';
import './PostCardLeft.scss';

type Props = {
  post: Post;
  className?: string;
};

export const PostCardLeft = ({ post, className }: Props) => {
  const classes = ['postCardLeft', className].filter(Boolean).join(' ');
  return (
    <article className={classes}>
      <Link href={post.slug} className='postCardLeft__link'>
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
