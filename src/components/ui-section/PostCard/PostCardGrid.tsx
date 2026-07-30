import { PostCardImgTop } from './PostCardImgTop';
import { PostCardImgLeft } from './PostCardImgLeft';
import { PostCardImgOverlay } from './PostCardImgOverlay';
import type { PostCardKind } from './types';
import type { Post } from '@/types/post';
import type { CSSProperties } from 'react';

type PostCardGridStyle = CSSProperties & {
  '--post-card-grid-column-num': number;
  '--post-card-grid-rows': string;
};

export type PostCardGridColumnNum = 1 | 2 | 3 | 4;
export type PostCardGridRowNum = 1 | 2 | 3 | 4;

type Props = {
  post?: Post;
  posts?: Post[];
  postCardKind?: PostCardKind;
  columnNum?: PostCardGridColumnNum;
  rowNum?: PostCardGridRowNum;
  rank?: number;
  className?: string;
};

const renderPostCard = (post: Post, postCardKind: PostCardKind, rank?: number, className?: string) => {
  switch (postCardKind) {
    case 'imgLeft':
      return <PostCardImgLeft post={post} rank={rank} className={className} />;
    case 'imgOver':
      return <PostCardImgOverlay post={post} rank={rank} className={className} />;
    default:
      return <PostCardImgTop post={post} rank={rank} className={className} />;
  }
};

export const PostCardGrid = ({ post, posts, postCardKind = 'imgLeft', columnNum = 2, rowNum, rank, className }: Props) => {
  if (posts) {
    const gridStyle: PostCardGridStyle = {
      '--post-card-grid-column-num': columnNum,
      '--post-card-grid-rows': rowNum === undefined ? 'none' : `repeat(${rowNum}, minmax(0, auto))`,
    };

    return (
      <ul
        data-component='PostCardGrid'
        className='m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(1,minmax(0,1fr))] [grid-template-rows:var(--post-card-grid-rows)] min-[480px]:[grid-template-columns:repeat(var(--post-card-grid-column-num),minmax(0,1fr))]'
        style={gridStyle}
      >
        {posts.map((item, index) => (
          <li key={item.id}>
            {renderPostCard(item, postCardKind, rank === undefined ? undefined : rank + index, className)}
          </li>
        ))}
      </ul>
    );
  }

  if (!post) return null;

  return renderPostCard(post, postCardKind, rank, className);
};
