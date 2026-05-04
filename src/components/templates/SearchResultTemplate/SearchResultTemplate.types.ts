import type { TBreadcrumbItem } from "@/components/ui-parts/Breadcrumb";
import type { FilterOption } from "@/components/features/Post/ListFilterBar/ListFilterBar.types";
import type { Post } from "@/types/post";

export type SearchResultTemplateProps = {
  breadcrumbItems: TBreadcrumbItem[];
  categoryLabel: string;
  heading: string;
  description?: string;
  query: string;
  posts: Post[];
  filterOptions: FilterOption[];
  activeFilter: string;
  onFilterSelect: (value: string) => void;
  isLoading: boolean;
  loadingMessage: string;
  emptyQueryMessage: string;
  emptyResultsMessage: string;
};
