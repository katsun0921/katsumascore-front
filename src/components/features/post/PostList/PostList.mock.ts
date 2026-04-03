import type { Post } from '@/components/features/post/PostCard/PostCard.types';
import {
  postCardCompactMock,
  postCardDefaultMock,
  postCardLoadingMock,
  postCardLongTitleMock,
  postCardNoImageMock,
} from '@/components/features/post/PostCard/PostCard.mock';

export const postListMock: Post[] = [
  postCardDefaultMock,
  postCardLongTitleMock,
  postCardNoImageMock,
  postCardCompactMock,
];

export const postListEmptyMock: Post[] = [];

export const postListLoadingMock: Post[] = Array.from({ length: 4 }, (_, index) => ({
  ...postCardLoadingMock,
  id: `loading-${index + 1}`,
  slug: `loading-${index + 1}`,
}));
