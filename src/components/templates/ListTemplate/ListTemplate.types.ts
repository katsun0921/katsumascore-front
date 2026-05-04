import type { FilterPost, Post } from '@/types/post';
import type { FilterOption } from '@/components/features/Post/ListFilterBar/ListFilterBar.types';
import type { SidebarProps } from '@/components/ui-layout/Sidebar';

export type ListTemplateProps = {
  categoryName: string;
  categoryDescription?: string;
  posts: Post[];
  filterOptionPosts?: FilterPost[];
  filterOptions?: FilterOption[];
  getFilterHref?: (value: string) => string;
  activeFilter?: string | string[];
  onFilterSelect?: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  sidebar?: SidebarProps;
  /** `true` のときパンくずを `ホーム / VOD / （サービス名）` とする（VOD 別一覧向け）。 */
  vodHubBreadcrumb?: boolean;
};
