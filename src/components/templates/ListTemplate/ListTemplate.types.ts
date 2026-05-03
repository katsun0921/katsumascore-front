import type { Post } from '@/types/post';
import type { FilterOption } from '@/components/features/Post/ListFilterBar/ListFilterBar.types';
import type { SidebarProps } from '@/components/ui-layout/Sidebar';

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
  sidebar?: SidebarProps;
};
