import type { FilterPost, Post } from '@/types/post';
import type { FilterOption } from '@/components/features/Post/ListFilterBar/ListFilterBar.types';
import type { SidebarProps } from '@/components/ui-layout/Sidebar';

export type ListTemplateProps = {
  categoryName: string;
  /** 見出し上のキッカー。既定は「カテゴリ」。一覧の性格が異なる場合に差し替える（例: 「上映中」）。 */
  categoryLabel?: string;
  categoryDescription?: string;
  posts: Post[];
  filterOptionPosts?: FilterPost[];
  filterOptions?: FilterOption[];
  /**
   * フィルターチップの行構成を丸ごと差し替える（`filterOptions` より優先）。
   * ソート語彙が既定（評価順 / 新着 / 配信中）と異なる一覧向け（例: 上映中一覧）。
   */
  filterOptionRows?: FilterOption[][];
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
  /** `true` のとき VOD 凡例と各記事の VOD バッジを非表示にする（VOD 別一覧は単一サービスのため）。 */
  singleVodService?: boolean;
};
