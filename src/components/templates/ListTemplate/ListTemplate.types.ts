import type { Post } from '@/components/features/Post/types/post';
import type { FilterOption } from '@/components/features/Post/ListFilterBar/ListFilterBar.types';

export type ListTemplateProps = {
  categoryName: string;
  categoryDescription?: string;
  posts: Post[];
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterSelect?: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
};
