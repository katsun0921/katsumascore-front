import { PostContent } from '@/components/features/post/PostContent/PostContent';
import { PostList } from '@/components/features/post/PostList/PostList';
import type { PostDetailProps } from './PostDetail.types';
import './PostDetail.scss';

export const PostDetail = ({ post, relatedPosts }: PostDetailProps) => {
  return (
    <article className='p-postDetail'>
      <header className='p-postDetail__header'>
        <h1 className='p-postDetail__title'>{post.title}</h1>

        <div className='p-postDetail__meta'>
          <time className='p-postDetail__date' dateTime={post.publishedAt}>
            {post.publishedAt}
          </time>

          {post.category && (
            <span className='p-postDetail__category'>{post.category}</span>
          )}

          {post.score !== undefined && (
            <span className='p-postDetail__score'>{post.score}</span>
          )}
        </div>
      </header>

      <div className='p-postDetail__body'>
        <PostContent content={post.content} />
      </div>

      {relatedPosts && relatedPosts.length > 0 && (
        <aside className='p-postDetail__related'>
          <h2 className='p-postDetail__relatedTitle'>関連記事</h2>
          <PostList posts={relatedPosts} variant='grid' />
        </aside>
      )}
    </article>
  );
};
