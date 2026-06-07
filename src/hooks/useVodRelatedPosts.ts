'use client';

import { useEffect, useState } from 'react';
import type { Post } from '@/types/post';

/**
 * VOD ターム ID に紐づく関連記事をクライアントサイドで取得する。
 * ISR の Worker CPU 超過を避けるため getStaticProps から分離。
 */
export type VodRelatedPostsState = {
  posts: Post[];
  /** vodTermId がある場合にフェッチが完了するまで true */
  loading: boolean;
};

export const useVodRelatedPosts = (vodTermId: number | undefined, postId: number, locale: string = 'ja'): VodRelatedPostsState => {
  const [posts, setPosts] = useState<Post[]>([]);
  // SSR/CSR ハイドレーション不一致（React #418）を防ぐため初期値は false。
  // マウント後の useEffect でフェッチ開始時に true にセットする。
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vodTermId === undefined) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vod-related?termId=${vodTermId}&excludeId=${postId}&lang=${locale}`);
        if (!res.ok) return;
        const data: Post[] = await res.json();
        setPosts(data);
      } catch {
        // フェッチ失敗時は空のまま（VOD関連記事セクションを非表示にするだけ）
      } finally {
        setLoading(false);
      }
    };
    void fetchPosts();
  }, [vodTermId, postId, locale]);

  return { posts, loading };
};
