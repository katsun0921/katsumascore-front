'use client';

import { useEffect, useState } from 'react';
import type { PickUpPost } from '@/components/features/PickUpAndScore/PickUpAndScore';

/**
 * 高スコア記事（スコア4以上）をクライアントサイドで取得する。
 * ISR の Worker CPU 超過を避けるため getStaticProps から分離。
 *
 * loading の初期値を false にすることで SSR/CSR ハイドレーション不一致（React #418）を防ぐ。
 * マウント後に useEffect が走り、フェッチ中だけ true になる。
 */
export type HighScorePostsState = {
  posts: PickUpPost[];
  loading: boolean;
};

export const useHighScorePosts = (): HighScorePostsState => {
  const [posts, setPosts] = useState<PickUpPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/high-score');
        if (!res.ok) return;
        const data: PickUpPost[] = await res.json();
        setPosts(data);
      } catch {
        // フェッチ失敗時は空のまま（サイドバーを非表示にするだけ）
      } finally {
        setLoading(false);
      }
    };
    void fetchPosts();
  }, []);

  return { posts, loading };
};
