# VOD 一覧 API 仕様書

> 対象: VOD タクソノミー別記事一覧用の WordPress カスタムエンドポイント
> 関連リポジトリ: フロント `katsumascore-front` / API（本仕様の実装先）= WordPress 側
> 最終更新: 2026-05-28

---

## ■ 背景

VOD 一覧ページ（`/vod/[slug]?page=N`）の SSR / SSG が遅い。フロント側のチューニングでは
限界に達したため、**WordPress 側に VOD 一覧専用のカスタムエンドポイントを新設**し、
API レイヤーから根本改善する。

### 現状の問題

| # | 問題 |
|---|---|
| 1 | フロントの SSR が**全ページを逐次ループ**で取得している |
| 2 | フィルタ（score / new / streaming / genre / tag）が**クライアント側**にあり、サーバーは全件返却を強いられる |
| 3 | 1 リクエストあたりのレスポンスに `content`（本文全文）/ `_embedded` / `_links` を含み**過剰**である |
| 4 | `?page=N` のページネーション URL は機能しているが、内部では全件取得しており**契約と実装が乖離**している |

### 解決の方向性

フィルタ・ソート・ページネーションを **WordPress API に寄せ**、`?page=2` のリクエストで
**20 件だけを返す**。これによりフロントは 1 リクエストで SSR を完結できる。

---

## ■ ゴール

- `?page=2` のリクエストで **指定件数（デフォルト 20 件）だけ**を返す
- フィルタ・ソート・ページネーションを **API 側で完結**させる
- レスポンスサイズを大幅に削減する（不要フィールドを排除）

---

## ■ エンドポイント仕様

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
| `per_page` | number | - | `20` | 1 ページあたりの件数（最大 100、**パラメータで可変**） |
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

### 7. エラーレスポンス

| ケース | ステータス | レスポンス |
|---|---|---|
| `vod` 未指定 | 400 | `{ "code": "missing_vod", "message": "vod parameter is required" }` |
| `vod` 該当なし | 404 | `{ "code": "vod_not_found", "message": "VOD term not found" }` |
| `page` 範囲外 | 200 | `{ "items": [], "meta": { ..., "total": N, "totalPages": M } }`（フロントで 404 判定） |
| 内部エラー | 500 | `{ "code": "internal_error", "message": "..." }` |

---

## ■ 実装方針（WordPress 側）

1. `register_rest_route( 'katsumascore/v1', '/vod-list', ... )`
2. `WP_Query` ではなく **`$wpdb` 直接クエリ**で必要列のみ SELECT
   （`ID`, `post_title`, `post_excerpt`, `post_date`, `post_modified`, `post_name`）
3. ACF / メタは **`get_post_meta( $ids )` の一括取得**で N+1 を回避
4. タクソノミーは `wp_get_object_terms()` でまとめて取得
5. アイキャッチは `wp_get_attachment_image_src()` を投稿ごとに 1 回だけ呼ぶ
6. `Cache-Control` ヘッダを付与
7. 言語フィルタは ACF `lang` を正とする（`lang=ja` 指定時は `en` 記事を除外）

---

## ■ 期待効果

| 指標 | Before | After（見込み） |
|---|---|---|
| SSR 内 API 往復回数 | N ページ分 | **1 回** |
| 1 リクエストのレスポンスサイズ | 全フィールド込み（推定 200KB+） | **必要最小限（推定 20〜40KB）** |
| クライアント側フィルタ処理 | 全件読み込んでから絞り込み | **不要（サーバー完結）** |

---

## ■ リスクと対応

| リスク | 対応 |
|---|---|
| WP プラグイン更新 / バージョンアップで `$wpdb` 直接クエリが影響を受ける | ユニットテストを追加。`WP_Query` フォールバック実装も検討 |
| キャッシュ purge のタイミングずれで古い一覧が表示される | 投稿保存時に Cloudflare purge webhook を叩く（将来対応） |
| 既存 URL `/vod/[slug]?page=N` の互換性 | URL 仕様は不変。フロント内部実装のみ差し替えるため影響なし |

---

## ■ Phase 0: 設計確定（実装前に詰める項目）

- [ ] ソート種別 `streaming` の対象 ACF フィールド名
- [ ] `genre` / `tag` のスラッグ仕様（複数指定時の AND / OR）
- [ ] 言語フィルタ仕様（`lang=ja` で `en` 記事を完全除外でよいか）

---

> フロント側（Next.js）の作業 TODO は `vod_list_api_todo.md` を参照。
