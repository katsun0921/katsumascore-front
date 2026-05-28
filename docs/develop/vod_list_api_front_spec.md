# VOD 一覧 API フロントエンド対応仕様書

> ステータス: 開発中
> 対象ブランチ: `feature/vod-list-api`
> 関連仕様: `katsumascore_wordpress_theme/docs/feature/VOD_LIST_API_SPEC.md`
> 最終更新: 2026-05-28

---

## ■ 背景と目的

VOD 一覧ページ（`/vod/[slug]?page=N`）の SSR が遅い根本原因は、フロント側のデータ取得アーキテクチャにある。

### 現状の問題

| # | 問題 |
|---|---|
| 1 | `loadVodArchivePage` が全ページを**逐次ループ**で取得している（N リクエスト） |
| 2 | フィルタ（score / new / streaming / genre / tag）が**クライアント側**にあり、サーバーは全件返却を強いられる |
| 3 | 1 リクエストあたり `content`（本文全文）/ `_embedded` / `_links` を含み**過剰** |
| 4 | 言語フィルタを `normalizePosts` でクライアント側が行い、取得件数が実際の表示件数より多い |

### 解決方針

WordPress 側に新設したカスタムエンドポイント `GET /wp-json/v1/vod-list` を使い、
フィルタ・ソート・ページネーションをサーバー側で完結させる。

---

## ■ 変更概要

### Before（旧アーキテクチャ）

```
loadVodArchivePage
  └─ getVodTermBySlug (1 req)
  └─ getPostsWithMeta (全ページ分 N req) ← ボトルネック
       └─ normalizePosts（クライアント側言語フィルタ）
       └─ ページ分割（クライアント側）
```

### After（新アーキテクチャ）

```
loadVodArchivePage
  └─ getVodTermBySlug (1 req) ← 名前取得のみ残す
  └─ getVodList (1 req)       ← 最大 100 件・言語フィルタ・ページネーションはサーバー側
       └─ VodListItem → Post / FilterPost（型マッピングのみ）
```

---

## ■ 新規 API 関数

### `getVodList(params, options?)`

**ファイル:** `src/libs/api/wordpress/endpoints/vodList.ts`

```ts
getVodList(params: VodListParams, options?: WpFetchOptions): Promise<VodListResponse | null>
```

#### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `vod` | `string` | ✓ | VOD タームスラッグ（`netflix`, `amazon-prime-video` 等） |
| `lang` | `'ja' \| 'en'` | - | 言語（デフォルト `ja`） |
| `page` | `number` | - | ページ番号（デフォルト `1`） |
| `per_page` | `number` | - | 1 ページあたり件数（デフォルト `20`、最大 `100`） |
| `filter` | `VodListFilter` | - | `'new' \| 'score' \| 'streaming'` |
| `genre` | `string` | - | ジャンルスラッグ（複数はカンマ区切り） |
| `tag` | `string` | - | タグスラッグ（複数はカンマ区切り） |

#### レスポンス型

```ts
type VodListResponse = {
  items: VodListItem[];
  meta: VodListMeta;   // { page, perPage, total, totalPages }
};

type VodListItem = {
  id: number;
  slug: string;
  lang: 'ja' | 'en';
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  featuredImage: VodListFeaturedImage | null;
  score: number | null;
  vods: VodListTerm[];
  genres: VodListTerm[];
  tags: VodListTerm[];
};
```

#### エラーハンドリング

| ケース | 戻り値 |
|---|---|
| 400 / 404 | `null` |
| 500 | `null`（再試行後） |
| 空ページ（`items: []`） | `VodListResponse`（フロント側で 404 判定） |

#### URL 導出

`WP_API_URL`（例: `https://cms.katsumascore.blog/wp-json/wp/v2`）から `/wp/v2` を除いて `/v1/vod-list` を付与。
`client.ts` の `wpRestBaseUrl` を経由して導出する。

---

## ■ `loadVodArchivePage` 移行内容

### 変更ファイル

`src/libs/loadVodArchivePage.ts`

### 移行方針

1. VOD ターム解決（`getVodTermBySlug`）は `categoryName` 取得のため**残す**
2. `getPostsWithMeta` の N 回ループを **`getVodList` 1 リクエスト**に置き換える
3. `normalizePosts` を廃止。`VodListItem → Post / FilterPost` の型マッピング関数に置き換える
4. `totalPages` は `meta.total / VOD_ARCHIVE_LIST_PER_PAGE` から算出する

### リクエスト仕様

```ts
getVodList({
  vod: term.slug,       // WP タームスラッグ
  lang: currentLocale,  // 'ja' | 'en'
  per_page: 100,        // allPosts 用に最大件数取得
})
```

### 型マッピング

| `VodListItem` フィールド | `Post` フィールド | 変換 |
|---|---|---|
| `id` (number) | `id` (string) | `String(item.id)` |
| `slug` | `slug` | そのまま |
| `title` | `title` | そのまま |
| `excerpt` | `excerpt` | そのまま |
| `featuredImage?.url` | `image` | `null` フォールバック |
| `date` | `publishedAt` | そのまま |
| `lang` | `lang` | そのまま |
| `score` (number \| null) | `score` (number \| undefined) | `?? undefined` |
| `vods[].slug` | `vods` (VodService[]) | 有効な VodService スラッグのみ抽出 |
| `genres` | `genres` | `{ name, slug }` に絞る |
| `tags` | `tags` | `{ name, slug }` に絞る |

---

## ■ Phase 1 の既知制限

| 制限 | 内容 | 影響 |
|---|---|---|
| `allPosts` が最大 100 件 | `per_page=100` のため 101 件目以降は `allPosts` に入らない | フィルタ選択肢（ジャンル・タグ）が 100 件以内に限定される |
| クライアント側フィルタのページネーション | `filteredTotalPages` は `allPosts` のサイズ依存 | 101 件以上の VOD サービスで全フィルタ結果が得られない |
| `type` / `year` フィールド未設定 | `VodListItem` にカテゴリなし | `Post.type` / `Post.year` が `undefined` |

---

## ■ Phase 2 計画（サーバーサイドフィルタ移行）

Phase 2 では `allPosts` の全件取得を廃止し、フィルタをサーバーに渡す設計に移行する。

### 変更スコープ

1. **`loadVodArchivePage` のシグネチャ変更**
   - 引数に `filter?: VodListFilter`, `genre?: string`, `tag?: string` を追加
   - `allPosts` を現在ページのみに縮小（または廃止）

2. **ページコンポーネントの変更**
   - `vod/[slug]/index.tsx` / `vod/[slug]/page/[page].tsx`
   - クライアント側フィルタロジック（`filterPostsByListFilters`）を削除
   - フィルタ変更時に `router.push` で URL を変えて ISR を経由させる（または client fetch）

3. **`VodArchivePageResult` 型の変更**
   - `allPosts` を削除 or `FilterPost[]`（現在ページのみ）に縮小
   - フィルタオプション（ジャンル・タグ一覧）を別フィールドに切り出す

### リクエスト数比較

| フェーズ | リクエスト数 |
|---|---|
| Before（旧） | N 回（全ページ分） |
| Phase 1（今回） | 1 回 |
| Phase 2（将来） | 1 回（フィルタも含む） |

---

## ■ 実装チェックリスト

### Phase 1（今回のスコープ）

- [x] `src/libs/api/wordpress/client.ts` — `wpRestBaseUrl` 追加
- [x] `src/libs/api/wordpress/endpoints/vodList.ts` — 新規作成
- [x] `src/libs/api/wordpress/index.ts` — エクスポート追加
- [ ] `src/libs/loadVodArchivePage.ts` — `getVodList` へ移行
- [ ] `docs/FEATURE_LIST.md` — 更新

### Phase 2（将来対応）

- [ ] `loadVodArchivePage` にフィルタ引数追加
- [ ] ページコンポーネントのクライアント側フィルタ削除
- [ ] `VodArchivePageResult` 型の整理
