# WPGraphQL for ACF 導入評価

> **v1.0** ― 初版  
> katsumascore.blog ｜ 2026年5月1日

---

## 1. 評価の背景

現在の KatsumaScore フロントエンドは WordPress REST API v2 を使用してコンテンツを取得している。
今後 VOD・フランチャイズ・アクターのカスタムポストタイプの追加が予定されており、
ACF フィールドの種類と複雑度が増加する見込み。

これを見据え、WPGraphQL for ACF への移行が REST API 運用を効率化できるかを評価した。
**結論: 現リリースでは見送り。カスタムポストタイプ追加時に再検討する。**

---

## 2. 現状アーキテクチャ

### 2.1 技術構成

| 項目 | 実装 |
|------|------|
| API プロトコル | WordPress REST API v2 |
| HTTP クライアント | `openapi-fetch` |
| 型定義 | `openapi-typescript`（OpenAPI 3.0 YAML から生成） |
| ランタイムバリデーション | Zod |
| データ変換 | 2フェーズ変換（parse → domain map） |

### 2.2 データ取得の流れ

```
WordPress REST API
  ↓ GET /wp/v2/posts?_embed=1&acf_format=standard
src/lib/api/wordpress/endpoints/posts.ts
  ↓ Zod バリデーション（schema.ts）
src/lib/api/wordpress/transform.ts → mapWPPostToPost()
  ↓
src/lib/buildPostDetailFromWp.ts（詳細ページ）
  ↓
components（正規化された Post 型のみ受け取る）
```

### 2.3 現状の課題

#### 課題 1: 常に `content` を過剰取得している

```typescript
// src/lib/api/wordpress/endpoints/posts.ts
const FIELDS = "id,slug,link,title,excerpt,content,date,modified,featured_media,acf,_links,_embedded";
```

一覧ページでは `content`（本文 HTML 全体）が不要だが、常に取得している。
`normalizePosts` で剥ぎ取るが、転送は発生している。

#### 課題 2: 詳細ページで最低 2〜3 回の API コール

```
1. getPostBySlug(slug)           メイン記事取得
2. extractRelationPostIds(acf)   ACF から関連記事 ID を掘り出す
3. getRelatedPosts([...ids])     関連記事を別途 batch fetch
```

#### 課題 3: ACF フィールド名バリアントの膨張

```typescript
// src/lib/api/wordpress/relations.ts
const RELATION_ACF_KEYS = [
  "related_posts", "related_movies", "relation_posts",
  "series_posts", "acf_relation", "rm_related", "relation_article",
];
```

REST ではフィールド名の揺れを後付けで吸収するしかなく、配列が拡張され続ける。

#### 課題 4: Zod スキーマの手動メンテナンス負担

WP REST API の癖（空配列 → undefined 変換、文字列 `"1"` → boolean 正規化、型なし typo フィールド維持など）を
Zod の前処理で吸収しており、WP 側のスキーマ変更時に手動での同期が必要になる。

```typescript
// looseBool: "1" / 1 / true をすべて boolean に正規化
const looseBool = z.preprocess((v: unknown) => {
  if (v === "1" || v === 1 || v === true) return true;
  if (v === "0" || v === 0 || v === false || v === "" || v == null) return false;
  return Boolean(v);
}, z.boolean());

// 空配列を undefined に変換（REST API が [] を返す場合がある）
const acfFromRest = z.preprocess((v: unknown) => {
  if (Array.isArray(v)) return undefined;
  return v;
}, wpPostAcfObjectSchema.optional());
```

---

## 3. WPGraphQL for ACF が解決すること

### 3.1 プラグイン構成

```
WordPress プラグイン:
  WPGraphQL         → /graphql エンドポイントを追加
  WPGraphQL for ACF → 登録済み ACF フィールドを GraphQL スキーマに自動公開
```

### 3.2 ACF フィールドの扱いの変化

| 項目 | REST + acf_format=standard | WPGraphQL for ACF |
|------|---------------------------|-------------------|
| フィールド取得 | `post.acf.review_score` | `post.reviewScore`（camelCase 自動変換） |
| 型情報 | Zod で手書き | GraphQL スキーマから codegen で自動生成 |
| Repeater | 配列→undefined の coerce 必要 | 型付きオブジェクト配列 |
| Boolean | `"1"/"0"/true/false` の正規化必要 | GraphQL Boolean 型で一意 |
| Relation | 複数フィールド名バリアントを手動対応 | 型付き relation フィールドを直接クエリ |

### 3.3 一覧ページの over-fetching 解消

GraphQL クエリで必要なフィールドのみ指定できるため、`content` を含まない一覧取得が可能。

```graphql
query PostList($first: Int!, $after: String, $lang: String) {
  posts(first: $first, after: $after, where: { language: $lang }) {
    nodes {
      id
      slug
      title
      excerpt
      date
      featuredImage { node { sourceUrl } }
      acfPost {
        reviewScore
        titleJp
        lang
        displaySettings { isFeatured }
      }
      terms(taxonomies: CATEGORY) { nodes { name } }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

### 3.4 詳細ページを単一クエリに統合

メイン記事と関連記事を 1 クエリで取得できる。

```graphql
query PostDetail($slug: String!) {
  postBy(slug: $slug) {
    id
    slug
    title
    content
    date
    modified
    featuredImage { node { sourceUrl } }
    acfPost {
      reviewScore
      titleJp
      titleEn
      acfSummaryGroup { summaryJp summaryEn }
      actorsFiled { name character role description }
      goodPointFiled
      officialUrl
      streamingVodNetflix
      streamingVodAmazon
      streamingVodUnext
      isCinemaShowing
      rentalServices { service url }
      trailerYoutubeId
      releaseDate
      copyright
      authorComment
      displaySettings { isFeatured }
      relatedPosts {
        nodes {
          id
          slug
          title
          featuredImage { node { sourceUrl } }
        }
      }
    }
  }
}
```

---

## 4. 採用コスト（変更範囲）

### 4.1 変更が必要なファイル

| ファイル / ディレクトリ | 変更内容 |
|------------------------|---------|
| `src/lib/api/wordpress/client.ts` | REST クライアント → GraphQL クライアント |
| `src/lib/api/wordpress/schema.ts` | Zod スキーマ → codegen 生成型 + 最小 Zod |
| `src/lib/api/wordpress/transform.ts` | フィールドパス変更に追従 |
| `src/lib/api/wordpress/endpoints/posts.ts` | REST エンドポイント → GraphQL クエリ関数 |
| `src/lib/buildPostDetailFromWp.ts` | ACF フィールドパス変更に追従 |
| `src/lib/api/wordpress/relations.ts` | `RELATION_ACF_KEYS` 配列管理が不要になる |
| `openapi/wp.yaml` | GraphQL スキーマ移行後は不要 |

### 4.2 新規追加

```
src/lib/api/graphql/        GraphQL クライアント + 生成型
codegen.ts                  graphql-codegen 設定
*.graphql                   クエリファイル
```

### 4.3 推奨パッケージ

```json
{
  "graphql-request": "^6.x",
  "@graphql-codegen/cli": "dev",
  "@graphql-codegen/typescript": "dev",
  "@graphql-codegen/typescript-operations": "dev",
  "@graphql-codegen/typescript-graphql-request": "dev"
}
```

Apollo Client は Node.js 依存があり Cloudflare Workers では使用不可。
`graphql-request`（fetch ベース、~5KB）を推奨する。

### 4.4 工数目安

| 移行スコープ | 工数 |
|-------------|------|
| 詳細ページのみ（graphql-codegen セットアップ含む） | 2〜3日 |
| 全体移行（一覧・検索・詳細すべて） | 5〜7日 |

---

## 5. リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| **GraphQL は POST リクエストのため CDN キャッシュ不可** | 高 | ISR に依存する構成であれば実用上問題ない。CDN キャッシュが必要な場合は APQ（Automatic Persisted Queries）で GET 変換 |
| `actors_filed`（typo）が GraphQL では `actorsFiled` に自動変換される | 中 | 移行時に transform 関数のフィールドパスを 1 箇所修正 |
| `official_sns` が WP 側で String か Object か不定 | 中 | introspection で事前確認。JSON scalar になる場合は追加処理が必要 |
| WPGraphQL プラグインの更新サイクル管理 | 低〜中 | WPGraphQL は活発にメンテされているが WP 更新との追従が必要 |
| 移行期間中のデュアルメンテ負担 | 中 | 詳細ページのみ先行移行することで影響を限定できる |

---

## 6. Cloudflare Workers・ISR/SSR との相性

### GraphQL POST と CDN キャッシュ

```
REST  GET  /wp-json/wp/v2/posts?slug=xxx  →  Cloudflare CDN キャッシュ可 ✅
GraphQL POST /graphql { query: "..." }    →  POST は CDN キャッシュ不可  ❌
```

ただし本プロジェクトは ISR（revalidate: 60）を採用しており、WP へのアクセスはビルド時・再検証時のみ。
通常リクエストは Cloudflare Workers のキャッシュから配信されるため、**ISR 構成の場合は実用上問題ない**。

CDN キャッシュを活用したい場合は APQ（Automatic Persisted Queries）で GET リクエストに変換できるが、追加設定が必要。

### Edge Runtime 互換性

| クライアント | Workers 互換 |
|-------------|-------------|
| `graphql-request` | ✅（fetch ベース） |
| Apollo Client | ❌（Node.js 依存） |
| urql | ✅（fetch ベース） |

---

## 7. 導入見送りの判断理由

1. **UI・機能の変化なし**: データ取得実装の入れ替えに過ぎないが、`src/lib/api/` 全体の書き直しとなり、リグレッションリスクを伴う
2. **現状の REST 実装が安定して機能している**: Zod によるバリデーション、2フェーズ変換による型安全性は十分
3. **改善効果が限定的**: 一覧の over-fetching は `_fields` パラメータで部分的に解決可能。関連記事の複数コールは現状でもページパフォーマンスとして問題になっていない
4. **WordPress プラグイン追加の管理コスト**: WPGraphQL + WPGraphQL for ACF のインストール・更新管理が加わる

---

## 8. カスタムポストタイプ追加時の移行計画

VOD・フランチャイズ・アクターのカスタムポストタイプを追加するタイミングで、
ACF フィールドの種類と複雑度が大幅に増加する。
このタイミングで以下の段階的移行を実施することを推奨する。

### 8.1 段階的移行手順

```
Step 1  WPGraphQL + WPGraphQL for ACF を WordPress にインストール
Step 2  /graphql で introspection し、ACF フィールドが期待通り公開されているか確認
Step 3  graphql-codegen で型生成し、既存の PostDetailData 型との差分を確認
Step 4  詳細ページのみ GraphQL クエリに移行（一覧は REST 維持）
Step 5  安定確認後、一覧・検索を GraphQL に移行
Step 6  openapi-fetch / openapi-typescript を削除
```

### 8.2 移行前に確認すべき事項

- `actors_filed`（typo フィールド）の GraphQL スキーマ上の名前（`actorsFiled` になる見込み）
- `official_sns` の型（String か JSON scalar か）
- カスタムポストタイプの GraphQL スキーマへの公開設定（WPGraphQL for ACF の設定画面で有効化が必要）
- ISR 構成のままで CDN キャッシュに支障がないか確認

---

*KatsumaScore WPGraphQL for ACF 導入評価 v1.0 ｜ katsumascore.blog ｜ 2026年5月1日*
