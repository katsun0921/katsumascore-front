import { PostCardImgLeft } from './PostCardImgLeft';
import { PostCardImgTop } from './PostCardImgTop';
import { PostCardImgOverlay } from './PostCardImgOverlay';
import type { PostCardKind } from './types';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
  kind: PostCardKind;
}

export const PostCardByKind = ({ post, kind }: Props) => {
  switch (kind) {
    case 'imgLeft': return <PostCardImgLeft post={post} />
    case 'imgOverlay': return <PostCardImgOverlay post={post} />
    default: return <PostCardImgTop post={post} />
  }
}
