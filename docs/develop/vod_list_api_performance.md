# VOD 一覧 API パフォーマンス改善 仕様書 & TODO

> 対象: VOD タクソノミー別記事一覧（`/vod/[slug]?page=N`）
> ブランチ: `claude/vod-list-performance-x4CcM`
> 最終更新: 2026-05-28

---

## ■ 背景

VOD 一覧ページの SSR / SSG が遅い。フロント側のチューニングでは限界に達したため、
**WordPress 側に VOD 一覧専用のカスタムエンドポイントを新設**し、API レイヤーから根本改善する。

### 現状の問題

| # | 問題 | 該当箇所 |
|---|---|---|
| 1 | SSR 時に**全ページを逐次ループ**で取得している | `src/libs/loadVodArchivePage.ts:75-90` |
| 2 | フィルタ（score / new / streaming / genre / tag）が**クライアント側**にあり、サーバーは全件返却を強いられる | `src/utils/listFilters.ts` |
| 3 | 1 リクエストあたりのレスポンスに `content`（本文全文）/ `_embedded` / `_links` を含み**過剰**である | `src/libs/api/wordpress/endpoints/posts.ts:18-19` |
| 4 | `?page=N` のページネーション URL は機能しているが、内部では全件取得しており**契約と実装が乖離**している | 同上 |

### ボトルネックの構造

```
[現状]
  ?page=2 へのアクセス
    ↓
  loadVodArchivePage()
    ↓
  while (rawPage <= totalPages) {
    getPostsWithMeta({ vod, page: rawPage, per_page: 13 })  // 全ページ逐次取得
  }
    ↓
  全件取得後、normalizePosts → クライアントで filter → page=2 分を切り出し
```

---

## ■ ゴール

- `?page=2` のリクエストで **20 件だけを取得**して SSR を完結させる
- フィルタ・ソート・ページネーションを **WordPress API に寄せる**
- レスポンスサイズを大幅に削減する（不要フィールドを排除）

---

## ■ 仕様

### 1. エンドポイント

```
GET {WP_API_URL}/katsumascore/v1/vod-list
```

### 2. クエリパラメータ

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|---|---|---|---|---|
| `vod` | string | ✓ | - | VOD タームスラッグ（例: `netflix`, `amazon`） |
| `lang` | `ja` \| `en` | - | `ja` | 言語（ACF `lang` フィールドでフィルタ） |
| `page` | number | - | `1` | ページ番号（1 始まり） |
| `per_page` | number | - | `20` | 1 ページあたりの件数（最大 100） |
| `filter` | `score` \| `new` \| `streaming` | - | `new` | ソート種別 |
| `genre` | string | - | - | ジャンルスラッグ（複数可: カンマ区切り） |
| `tag` | string | - | - | タグスラッグ（複数可: カンマ区切り） |

### 3. レスポンス

```jsonc
{
  "items": [
    {
      "id": 123,
      "slug": "post-slug",
      "lang": "ja",
      "title": "記事タイトル",
      "excerpt": "記事抜粋（HTMLタグ除去済み）",
      "date": "2026-01-01T00:00:00",
      "modified": "2026-01-15T00:00:00",
      "featuredImage": {
        "url": "https://.../image.jpg",
        "width": 1200,
        "height": 630,
        "alt": "image alt"
      },
      "score": 4,
      "vods": [
        { "id": 10, "slug": "netflix", "name": "Netflix" }
      ],
      "genres": [
        { "id": 5, "slug": "action", "name": "アクション" }
      ],
      "tags": [
        { "id": 8, "slug": "2024", "name": "2024年" }
      ]
    }
  ],
  "meta": {
    "page": 2,
    "perPage": 20,
    "total": 247,
    "totalPages": 13
  }
}
```

### 4. レスポンスから**除外**するフィールド

| フィールド | 理由 |
|---|---|
| `content` | 一覧では本文不要 |
| `_embedded` | アイキャッチ・タクソノミー情報は `featuredImage` / `vods` / `genres` / `tags` に集約 |
| `_links` | HATEOAS 不要 |
| `meta`（生 WP メタ）| 一覧で必要なものは `score` / `lang` のみ。それ以外は破棄 |
| `acf`（生 ACF）| 同上 |

### 5. ソート仕様

| filter | 並び順 |
|---|---|
| `new`（デフォルト） | `date DESC`（投稿日新しい順） |
| `score` | ACF `score` DESC（同点は `date DESC`） |
| `streaming` | 配信開始日 DESC（ACF フィールド名は実装時に確認） |

### 6. キャッシュ

| 層 | 戦略 |
|---|---|
| WordPress | `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` を付与 |
| Cloudflare | エッジキャッシュを利用（タグベース purge を将来検討） |
| Next.js | ISR（`revalidate: 3600`）。`?page=1` のみ SSG、それ以降は ISR |

### 7. エラーレスポンス

| ケース | ステータス | レスポンス |
|---|---|---|
| `vod` 未指定 | 400 | `{ "code": "missing_vod", "message": "vod parameter is required" }` |
| `vod` 該当なし | 404 | `{ "code": "vod_not_found", "message": "VOD term not found" }` |
| `page` 範囲外 | 200 | `{ "items": [], "meta": { ..., "total": N, "totalPages": M } }`（フロントで 404 判定） |
| 内部エラー | 500 | `{ "code": "internal_error", "message": "..." }` |

---

## ■ 実装方針

### WordPress 側（プラグイン or `functions.php`）

1. `register_rest_route( 'katsumascore/v1', '/vod-list', ... )`
2. `WP_Query` ではなく **`$wpdb` 直接クエリ**で必要列のみ SELECT（`ID`, `post_title`, `post_excerpt`, `post_date`, `post_modified`, `post_name`）
3. ACF / メタは **`get_post_meta( $ids )` の一括取得**で N+1 を回避
4. タクソノミーは `wp_get_object_terms()` でまとめて取得
5. アイキャッチは `wp_get_attachment_image_src()` を 1 回だけ呼ぶ

### Next.js 側

1. `src/libs/api/wordpress/endpoints/vodList.ts` を新設
   - `getVodList({ vod, lang, page, perPage, filter, genre, tag })`
2. `src/libs/loadVodArchivePage.ts` の逐次ループを廃止し、1 リクエスト化
3. `src/utils/listFilters.ts` のクライアント側フィルタを撤去（または URL 同期に変更）
4. フィルタ UI は `URLSearchParams` を介して API へ伝搬

---

## ■ TODO

### Phase 0: 設計確定

- [ ] 本仕様書のレビュー（特にソート種別 `streaming` の対象 ACF フィールド名）
- [ ] `genre` / `tag` のスラッグ仕様確認（複数指定時の AND / OR）
- [ ] レスポンスの言語フィルタ仕様確認（`lang=ja` で `en` 記事を完全除外でよいか）

### Phase 1: WordPress 側エンドポイント実装

- [ ] `katsumascore/v1/vod-list` ルート登録
- [ ] `$wpdb` 直接クエリでベース投稿リスト取得
- [ ] ACF メタ一括取得（`score` / `lang` / 配信開始日）
- [ ] タクソノミー一括取得（`vod` / `genre` / `tag`）
- [ ] アイキャッチ URL の集約
- [ ] ソート（`new` / `score` / `streaming`）実装
- [ ] フィルタ（`genre` / `tag`）実装
- [ ] `Cache-Control` ヘッダ付与
- [ ] エラーレスポンス実装
- [ ] OpenAPI スキーマ追加（`openapi/wp.yaml`）

### Phase 2: Next.js 側差し替え

- [ ] `src/libs/api/wordpress/endpoints/vodList.ts` 新設
  - `getVodList()` の型定義は OpenAPI から自動生成
- [ ] `src/libs/loadVodArchivePage.ts` を 1 リクエスト化に書き換え
  - 全ページ逐次ループ削除（:75-90）
  - `normalizePosts` をエンドポイント側に寄せる or 簡素化
- [ ] `src/pages/vod/[slug]/index.tsx` の `getStaticProps` / `getServerSideProps` 更新
- [ ] クライアント側フィルタ撤去（`src/utils/listFilters.ts` の VOD 用関数）
- [ ] フィルタ UI の URL 連動対応
- [ ] ページネーションコンポーネントが `meta.totalPages` を参照する形に変更

### Phase 3: 検証

- [ ] WP API への直接リクエストで件数・順序・フィルタ動作確認（`curl`）
- [ ] `npm run lint` / `npm run lint:scss`
- [ ] ローカルで `/vod/netflix?page=1`〜`?page=N` の表示確認
- [ ] 各フィルタ（`filter=score`、`genre=action`、`tag=2024`）の動作確認
- [ ] レスポンスサイズ計測（Before / After）
- [ ] SSR 所要時間計測（Before / After）

### Phase 4: ドキュメント更新

- [ ] 完了後 `docs/develop/vod_list_api_performance.md` → `docs/features/` へ移動
- [ ] `docs/FEATURE_LIST.md` §2 API エンドポイントに追加
- [ ] `.claude/rules/src/libs.md` の wordpress.ts 関数一覧に `getVodList` 追加

---

## ■ 期待効果

| 指標 | Before | After（見込み） |
|---|---|---|
| SSR 内 API 往復回数 | N ページ分（例: 13 回） | **1 回** |
| 1 リクエストのレスポンスサイズ | 全フィールド込み（推定 200KB+） | **必要最小限（推定 20〜40KB）** |
| クライアント側フィルタ処理 | 全件読み込んでから絞り込み | **不要（サーバー完結）** |
| TTFB（SSR） | （計測値を Phase 3 で記載） | （同上） |

---

## ■ リスクと対応

| リスク | 対応 |
|---|---|
| WP プラグイン更新 / バージョンアップで `$wpdb` 直接クエリが影響を受ける | ユニットテストを WP 側に追加。`WP_Query` フォールバック実装も検討 |
| キャッシュ purge のタイミングずれで古い一覧が表示される | 投稿保存時に Cloudflare purge webhook を叩く（将来対応） |
| 既存 URL `/vod/[slug]?page=N` の互換性 | URL 仕様は不変。内部実装のみ差し替えるため影響なし |

---

## ■ 関連ファイル

- `src/libs/loadVodArchivePage.ts` — 既存のローダー（差し替え対象）
- `src/libs/api/wordpress/endpoints/posts.ts` — 既存の posts 取得（参考）
- `src/pages/vod/[slug]/index.tsx` — VOD 一覧ページ（呼び出し元）
- `src/utils/listFilters.ts` — クライアント側フィルタ（撤去対象）
- `openapi/wp.yaml` — OpenAPI スキーマ（追記対象）
