'use client';

import { useEffect, useState } from 'react';
import type { ActorTermEntry } from '@/libs/loadPostDetailPage';

type OtherWork = { title: string; href: string; score?: number };

/** キャスト名 → otherWorks の CSR フェッチ結果マップ */
export type ActorWorksMap = Map<string, OtherWork[]>;

/**
 * キャストのフィルモグラフィー（otherWorks）をクライアントサイドで並列取得する。
 * ISR 時の Worker CPU 超過を避けるために Server 側フェッチから分離。
 */
export const useActorWorks = (
  actorTermEntries: ActorTermEntry[],
  postId: number,
): ActorWorksMap => {
  const [worksMap, setWorksMap] = useState<ActorWorksMap>(new Map());

  useEffect(() => {
    if (actorTermEntries.length === 0) return;

    const fetchAll = async () => {
      const entries = await Promise.all(
        actorTermEntries.map(async ({ actorName, termId, taxType }) => {
          try {
            const res = await fetch(
              `/api/actor-works?termId=${termId}&taxType=${taxType}&excludeId=${postId}`,
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
    };

    void fetchAll();
  }, [actorTermEntries, postId]);

  return worksMap;
};
