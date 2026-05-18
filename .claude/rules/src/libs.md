---
paths:
  - src/libs/**
---

# src/libs/

ユーティリティ関数・APIクライアントを管理するディレクトリ。

## 関数・メソッドの説明コメント（必須）

ルート `CLAUDE.md` の「src/libs のドキュメント」に従う。本ディレクトリの `.ts` では、**エクスポート関数・クラスメソッド・意味のあるローカル関数**のそれぞれの直前に、日本語の JSDoc（`/** */` 推奨）で説明を書く。型・定数のみのファイルは対象外。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `wordpress.ts` | WP REST API クライアント |
| `ranking.ts` | スコアランク変換関数（1〜5 → SS/S/A/B/C） |
| `i18n.ts` | 多言語ヘルパー関数 |
| `vod.ts` | Cloudflare KV アクセス |
| `seasonalReviewParent.ts` | 季節レビュー親固定ページをスラッグから ID に解決 |

## wordpress.ts の関数一覧

- `getPosts(params?)` — 記事一覧取得
- `getPostBySlug(slug, lang?)` — スラッグで記事取得
- `getCategories(lang?)` — カテゴリー一覧取得
- `getCategoriesForArchiveResolve(locale?)` — `lang` 付きが空のとき `lang` 無しで再取得（アーカイブ用）
- `getPostsByCategory(categoryId, lang?)` — カテゴリー別記事取得
- `getRelatedPosts(ids)` — 関連記事取得
- `searchPosts(query, lang?)` — 記事検索

共通仕様:
- ベースURL: `process.env.WP_API_URL`
- 全リクエストに `_embed&acf_format=standard` を付与
- エラー時は `null` を返す（`try/catch`）
- 記事の言語は **ACF `lang`** を正とする。一覧は `normalizePosts` で `m.lang` によりフィルタする

## ranking.ts の仕様

`inc/get-ranking-icon.php` の `get_ranking_icon()` をTypeScriptに移植したもの。

```ts
export function getScoreRank(score: 1 | 2 | 3 | 4 | 5): 'SS' | 'S' | 'A' | 'B' | 'C'
```

| スコア | ランク |
|---|---|
| 5 | SS |
| 4 | S |
| 3 | A |
| 2 | B |
| 1 | C |
