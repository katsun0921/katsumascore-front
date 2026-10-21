/**
 * SSG 凍結ブランチ専用の incremental cache。
 *
 * `@opennextjs/cloudflare` の static assets cache は、事前生成物を `ja/anime/foo.cache` のようなパス名で配置する。
 * 一方 Next.js 16.3 の Pages Router は `/route-cache/PAGES/<hash>/$/ja/anime/foo` というキーで参照するため、
 * そのままでは全リクエストが cache miss になり、実行時に `getStaticProps`（= WordPress 取得）が走ってしまう。
 * ここでキーをパス名へ変換して読み出す。実行時は読み取り専用で、書き込み・削除は何もしない。
 */
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";
import type { IncrementalCache } from "@opennextjs/aws/types/overrides.js";

const ROUTE_CACHE_KEY = /^\/route-cache\/[^/]+\/[^/]+\/\$(\/.*)$/;

/** `/route-cache/PAGES/<hash>/$/ja/foo` を `/ja/foo` に変換する。該当しないキーはそのまま返す。 */
const toPathKey = (key: string): string => key.match(ROUTE_CACHE_KEY)?.[1] ?? key;

const freezeIncrementalCache: IncrementalCache = {
  // `populateCache` が名前でキャッシュ種別を判定するため、元の名前を引き継ぐ
  name: staticAssetsIncrementalCache.name,
  get: (key, cacheType) => staticAssetsIncrementalCache.get(toPathKey(key), cacheType),
  set: async () => {},
  delete: async () => {},
};

export default freezeIncrementalCache;
