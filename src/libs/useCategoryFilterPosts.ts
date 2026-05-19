/**
 * カテゴリ一覧フィルタ用の全記事一覧を CSR で取得するフック。
 * ISR の allPosts を置き換え、/api/category-filter-posts から非同期で取得する。
 */
import { useState, useEffect } from 'react';
import type { FilterPost } from '@/types/post';
import type { CategoryFilterPostsResponse } from '@/pages/api/category-filter-posts';

type UseCategoryFilterPostsResult = {
  allPosts: FilterPost[];
  totalPages: number | null;
  isLoading: boolean;
};

/** `/api/category-filter-posts` から `slug`・`locale` に対応するフィルタ用全記事を取得する。 */
export const useCategoryFilterPosts = (
  slug: string,
  locale: string,
  perPage?: number,
): UseCategoryFilterPostsResult => {
  const [allPosts, setAllPosts] = useState<FilterPost[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ slug, locale });
    if (perPage !== undefined) params.set('perPage', String(perPage));

    let cancelled = false;

    const load = async () => {
      try {
        const r = await fetch(`/api/category-filter-posts?${params.toString()}`);
        const data = (await r.json()) as CategoryFilterPostsResponse;
        if (!cancelled) {
          setAllPosts(data.posts);
          setTotalPages(data.totalPages);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug, locale, perPage]);

  return { allPosts, totalPages, isLoading };
};
