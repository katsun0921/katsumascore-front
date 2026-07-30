import { PostCardImgLeft } from './PostCardImgLeft';
import { PostCardImgTop } from './PostCardImgTop';
import { PostCardImgOverlay } from './PostCardImgOverlay';
import type { PostCardKind, PostCardListType } from './types';
import type { Post } from '@/types/post';

type Props = {
  post?: Post;
  posts?: Post[];
  leadingPostCardKind?: PostCardKind;
  postCardKind?: PostCardKind;
  listType?: PostCardListType;
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

export const PostCardListVertical = ({
  post,
  posts,
  leadingPostCardKind,
  postCardKind = 'imgLeft',
  listType = 'ul',
  rank,
  className,
}: Props) => {
  if (posts) {
    const ListTag = listType;

    return (
      <ListTag data-component='PostCardListVertical' className={['m-0 flex list-none flex-col gap-3 p-0', className].filter(Boolean).join(' ')}>
        {posts.map((item, index) => {
          const kindForItem =
            leadingPostCardKind !== undefined && index === 0 ? leadingPostCardKind : postCardKind;
          return (
            <li key={item.id}>
              {renderPostCard(item, kindForItem, rank === undefined ? undefined : rank + index)}
            </li>
          );
        })}
      </ListTag>
    );
  }

  if (!post) return null;

  return renderPostCard(post, postCardKind, rank, className);
};
