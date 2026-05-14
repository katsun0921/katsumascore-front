import type { Person } from '@/types/entity';
import type { Post } from '@/types/post';

export type PersonTemplateProps = {
  person: Person;
  castPosts: Post[];
  directorPosts: Post[];
};
