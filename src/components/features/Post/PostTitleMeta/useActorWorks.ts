'use client';

import { isSsgFreeze } from '@/libs/freeze/ssgFreeze';
import { useEffect, useState } from 'react';
import type { ActorTermEntry } from '@/libs/loadPostDetailPage';

type OtherWork = { title: string; href: string; character?: string };

/** キャスト名 → otherWorks の CSR フェッチ結果マップ */
export type ActorWorksMap = Map<string, OtherWork[]>;

export type ActorWorksState = {
  worksMap: ActorWorksMap;
  /** キャストが存在する場合にフェッチが完了するまで true */
  loading: boolean;
};

/**
 * キャストのフィルモグラフィー（otherWorks）をクライアントサイドで並列取得する。
 * ISR 時の Worker CPU 超過を避けるために Server 側フェッチから分離。
 */
export const useActorWorks = (
  actorTermEntries: ActorTermEntry[],
  postId: number,
): ActorWorksState => {
  const [worksMap, setWorksMap] = useState<ActorWorksMap>(new Map());
  const [loading, setLoading] = useState(actorTermEntries.length > 0 && !isSsgFreeze());

  useEffect(() => {
    // 凍結モードでは WP へ依存する API を呼ばない（他作品の表示は省略される）
    if (actorTermEntries.length === 0 || isSsgFreeze()) return;

    const fetchAll = async () => {
      const entries = await Promise.all(
        actorTermEntries.map(async ({ actorName, personId }) => {
          try {
            const res = await fetch(
              `/api/actor-works?personId=${personId}&excludeId=${postId}`,
            );
            if (!res.ok) return null;
            const works: OtherWork[] = await res.json();
            return works.length > 0 ? ([actorName.toLowerCase(), works] as const) : null;
          } catch {
            return null;
          }
        }),
      );

      const map = new Map<string, OtherWork[]>();
      for (const entry of entries) {
        if (entry) map.set(entry[0], entry[1]);
      }
      setWorksMap(map);
      setLoading(false);
    };

    void fetchAll();
  }, [actorTermEntries, postId]);

  return { worksMap, loading };
};
