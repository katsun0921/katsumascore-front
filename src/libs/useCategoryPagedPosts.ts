/**
 * カテゴリ一覧ページのフィルタ・ページネーション済み投稿を CSR で取得するフック。
 * 初期表示（page=1・フィルタなし）は ISR の posts をそのまま使い、
 * ページ変更・フィルタ変更時のみ /api/category-filter-posts から Post[] を取得する。
 */
import { useState, useEffect } from 'react';
import type { FilterPost, Post } from '@/types/post';
import type { CategoryPagedPostsResponse } from '@/pages/api/category-filter-posts';

type UseCategoryPagedPostsOptions = {
  slug: string;
  locale: string;
  page: number;
  sortFilter: string;
  taxonomyFilter?: string;
  perPage?: number;
  /** ISR で取得済みの初期投稿。page=1・フィルタなしの初期表示に使う。 */
  initialPosts: Post[];
  initialTotalPages: number;
};

type UseCategoryPagedPostsResult = {
  posts: Post[];
  filterPosts: FilterPost[];
  totalPages: number;
  isLoading: boolean;
};

const isInitialState = (page: number, sortFilter: string, taxonomyFilter?: string): boolean =>
  page === 1 && sortFilter === 'score' && taxonomyFilter === undefined;

/** `/api/category-filter-posts` からフィルタ・ページ指定で Post[] を取得する。 */
export const useCategoryPagedPosts = ({
  slug,
  locale,
  page,
  sortFilter,
  taxonomyFilter,
  perPage,
  initialPosts,
  initialTotalPages,
}: UseCategoryPagedPostsOptions): UseCategoryPagedPostsResult => {
  const useInitial = isInitialState(page, sortFilter, taxonomyFilter);

  const [csrPosts, setCsrPosts] = useState<Post[] | null>(null);
  const [filterPosts, setFilterPosts] = useState<FilterPost[]>([]);
  const [csrTotalPages, setCsrTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(!useInitial);

  useEffect(() => {
    if (useInitial) return;

    let cancelled = false;

    const load = async () => {
      try {
        const params = new URLSearchParams({ slug, locale, page: String(page) });
        if (sortFilter && sortFilter !== 'score') params.set('filter', sortFilter);
        if (taxonomyFilter) {
          const [type, ...rest] = taxonomyFilter.split(':');
          if (type === 'genre') params.set('genre', rest.join(':'));
          else if (type === 'tag') params.set('tag', rest.join(':'));
        }
        if (perPage !== undefined) params.set('perPage', String(perPage));

        const r = await fetch(`/api/category-filter-posts?${params.toString()}`);
        // 503（WP 取得失敗）時に空配列で上書きすると一覧が消えるため、初期表示を維持する
        if (!r.ok) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const data = (await r.json()) as CategoryPagedPostsResponse;
        if (!cancelled) {
          setCsrPosts(data.posts);
          setFilterPosts(data.filterPosts);
          setCsrTotalPages(data.totalPages);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [slug, locale, page, sortFilter, taxonomyFilter, perPage, useInitial]);

  const posts = useInitial || csrPosts === null ? initialPosts : csrPosts;
  const totalPages = useInitial || csrTotalPages === null ? initialTotalPages : csrTotalPages;

  return { posts, filterPosts, totalPages, isLoading };
};
