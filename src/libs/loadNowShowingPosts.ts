/**
 * 上映中の作品一覧ページ（`/now-showing`）用のデータ取得。
 *
 * 上映中の記事は常時数件〜十数件と母数が小さいため、1ページ分ずつ取りに行かず
 * 全件を ISR で取得し、ソート・絞り込み・ページングはクライアント側で行う
 * （`nowShowingFilters`）。フィルタを切り替えるたびの再取得が不要になる。
 *
 * WP 側の実装は `/wp-json/v1/theater-list`。
 * @see katsumascore_wordpress_theme/docs/feature/THEATER_LIST_API_SPEC.md
 */
import { getTheaterList } from "@/libs/api/wordpress";
import { theaterListItemToPost } from "@/utils/theaterListItemToPost";
import { toSerializableValue } from "@/utils/toSerializableValue";
import type { Post } from "@/types/post";

/** 1リクエストで取る件数（エンドポイントの上限）。 */
const FETCH_PER_PAGE = 100;

/** 取得するページ数の上限。上映中は数件〜十数件のため 3 ページ（300件）で十分な余裕がある。 */
const MAX_FETCH_PAGES = 3;

/** 上映中一覧は1〜数リクエストで完了する。実測は `category-list` と同程度 */
const FETCH_OPTIONS = { timeoutMs: 8000, maxRetries: 1 } as const;

export type NowShowingPostsResult =
  /**
   * WP からの取得に失敗した（一時的な障害）。
   * 呼び出し側は 404 を焼き付けず、空一覧を短い `revalidate` で生成して
   * リクエスト時の ISR 再生成で復旧させる（`loadCategoryListPage` と同じ方針）。
   */
  | { fetchFailed: true }
  | { posts: Post[] };

/**
 * 上映中の記事を劇場公開日の新しい順で全件取得し、表示用の `Post` 配列にして返す。
 * 並び順は WP 側の `filter=release`（公開日降順）をそのまま保持する。
 *
 * @param locale — ルートのロケール。`en` のみ英語、それ以外は日本語として扱う。
 */
export const loadNowShowingPosts = async (locale: string): Promise<NowShowingPostsResult> => {
  const lang = locale === "en" ? "en" : "ja";

  const first = await getTheaterList(
    { lang, page: 1, perPage: FETCH_PER_PAGE, filter: "release" },
    FETCH_OPTIONS,
  );
  if (!first) {
    console.error(`[loadNowShowingPosts] 上映中の記事を取得できなかった（lang=${lang}）`);
    return { fetchFailed: true };
  }

  const items = [...first.items];
  const lastPage = Math.min(first.meta.totalPages, MAX_FETCH_PAGES);
  for (let page = 2; page <= lastPage; page += 1) {
    const next = await getTheaterList({ lang, page, perPage: FETCH_PER_PAGE, filter: "release" }, FETCH_OPTIONS);
    // 途中ページの失敗は取得済み分を活かす（一覧が丸ごと空になるより実害が小さい）
    if (!next) {
      console.error(`[loadNowShowingPosts] ${page}ページ目を取得できなかった（lang=${lang}）`);
      break;
    }
    items.push(...next.items);
  }

  return { posts: toSerializableValue(items.map((item) => theaterListItemToPost(item, lang))) };
};
