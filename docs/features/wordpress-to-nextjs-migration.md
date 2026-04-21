# WordPress → Next.js 移行手順

> 対象: `katsumascore_wordpress_theme` → `katsumascore-front`（Next.js）
> 作成日: 2026-04-21

---

## 0. 全体方針

- WordPress テーマの「移植」ではなく、Next.js での「再設計」とする
- WordPress 生データ（`post.title.rendered` 等）は `lib/api` で正規化し、UI 層には渡さない
- ACF / Polylang などのプラグイン依存は `lib/api` 層で吸収する
- レイヤー構成は `CLAUDE.md` の規約（ui-parts / ui-layout / ui-section / features / templates）に従う

---

## 1. テンプレート対応マップ

| WordPress テンプレート | Next.js ページ / テンプレート |
|---|---|
| `page-home.php` | `pages/index.tsx` + `HomeTemplate` |
| `archive.php` | `pages/[category]/index.tsx` + `ListTemplate` |
| `single.php` | `pages/[...slug].tsx` + `PostDetail` |
| `search.php` | `pages/search.tsx` + `ListTemplate` |
| `page-top.php` | `pages/top.tsx` |
| `page-featured-article.php` | `pages/featured.tsx` |
| `page-seasonal-anime-and-dramas-reviews.php` | `pages/seasonal-reviews/index.tsx` |
| `404.php` | `pages/404.tsx` + `NotFoundTemplate` |
| `header.php` / `footer.php` / `sidebar.php` | `PageLayout` + `ui-layout/Header` + `ui-layout/Footer` + `ui-layout/Sidebar` |

---

## 2. データフロー設計

```
WordPress REST API / ACF API
        ↓
lib/api/wordpress.ts     ← fetch + 生データ取得
lib/api/wordpress.schema.ts  ← Zod等でバリデーション
        ↓
features/（transform / normalize）
        ↓
components（正規化済みデータのみ受け取る）
        ↓
pages（getStaticProps / getServerSideProps）
```

### 正規化の原則

- `post.title.rendered` → `normalizedPost.title`
- `post.acf.score` → `normalizedPost.score`
- `post._embedded['wp:featuredmedia'][0].source_url` → `normalizedPost.thumbnail`
- ACF の VOD フィールド → `normalizedPost.vod[]`
- Polylang の言語メタ → `normalizedPost.locale`

---

## 3. ページ別移行手順

### 3-1. ホームページ（`page-home.php` → `pages/index.tsx`）

**WordPress の動的処理**

- ランダムタグ3つ取得 → タグ別投稿一覧
- カテゴリー `movie-ja` の新着6件
- カテゴリー `anime` の新着6件
- 季節アニメレビュー子ページ一覧
- Facebook ページ埋め込み
- 広告バナー（A8.net / admax）

**Next.js での対応**

```tsx
// pages/index.tsx
export const getStaticProps = async () => {
  const [tags, movies, anime, seasonalReviews] = await Promise.all([
    fetchRandomTags(3),
    fetchPostsByCategory('movie-ja', 6),
    fetchPostsByCategory('anime', 6),
    fetchSeasonalReviewPages(),
  ])
  return { props: { tags, movies, anime, seasonalReviews }, revalidate: 3600 }
}
```

**コンポーネント配置**

```
templates/HomeTemplate   ← 画面構造
  ui-home/HomeCard       ← タグ別カードリスト
  ui-home/HomeCardScrollList  ← 横スクロール
  features/AdBanner      ← 広告バナー
  features/OfficialSns   ← Facebook埋め込み
```

---

### 3-2. アーカイブ（`archive.php` → `pages/[category]/index.tsx`）

**WordPress の動的処理**

- カテゴリー / タグ / 著者アーカイブ
- `post-image-left` コンポーネントでリスト表示
- ページネーション

**Next.js での対応**

```tsx
// pages/[category]/index.tsx
export const getStaticPaths = async () => { /* カテゴリー一覧から生成 */ }
export const getStaticProps = async ({ params }) => {
  const posts = await fetchPostsByCategory(params.category, { page: 1 })
  return { props: { posts }, revalidate: 3600 }
}
```

**コンポーネント配置**

```
templates/ListTemplate
  ui-section/PostList
    ui-section/PostCard/PostCardImgLeft
  features/pagination/Pagination
  ui-parts/Breadcrumb
```

---

### 3-3. 記事詳細（`single.php` → `pages/[...slug].tsx`）

**WordPress の動的処理**

- Polylang: 言語別タイトル取得（`title_en` / `title_jp` ACF）
- ACF: スコア・レビュー・VOD・良い点・まとめ・俳優情報
- 関連記事（relation / series / tag / category）
- 映画公開中フラグによる VOD 表示切り替え
- レンタルサービス広告（日本語ページのみ）

**Next.js での対応**

```tsx
// pages/[...slug].tsx
export const getStaticProps = async ({ params, locale }) => {
  const post = await fetchPostBySlug(params.slug, locale)
  const related = await fetchRelatedPosts(post.id)
  return { props: { post, related }, revalidate: 3600 }
}
```

**コンポーネント配置**

```
templates/PostDetail
  ui-parts/Heading
  features/Post/PostDate
  features/Post/PostContent      ← 本文 + ACF フィールド
  ui-layout/Sidebar
  features/StreamingVod          ← ACF VOD
  features/AdRental              ← レンタル広告（ja のみ）
  features/RelationPost          ← 関連 / シリーズ / タグ
  ui-parts/ShareButtons
  ui-parts/Breadcrumb
```

---

### 3-4. 検索（`search.php` → `pages/search.tsx`）

**WordPress の動的処理**

- `get_search_query()` による全文検索
- `post-image-left` でリスト表示

**Next.js での対応**

```tsx
// pages/search.tsx  ← ISR 不可、CSR または SSR
export default const SearchPage = () => {
  // useRouter().query.s でキーワード取得
  // features/Search コンポーネントがクライアントサイドで検索
}
```

---

## 4. プラグイン依存の処理

### Polylang（多言語）

| WordPress | Next.js |
|---|---|
| `pll_current_language()` | `useLocale()` from `@/i18n/provider` |
| `pll_get_post($id, 'en')` | `fetchPostBySlug(slug, locale)` |
| `pll_home_url()` | `next/router` の `locale` |

### ACF（Advanced Custom Fields）

- REST API 拡張（`acf-to-rest-api` 等）で `/wp-json/wp/v2/posts/{id}?acf_format=standard` から取得
- `lib/api/wordpress.ts` の `transformPost()` で正規化

```ts
// lib/api/wordpress.ts の例
const transformPost = (raw: WPPost): NormalizedPost => ({
  id: raw.id,
  title: raw.acf?.title_jp ?? raw.title.rendered,
  titleEn: raw.acf?.title_en ?? raw.title.rendered,
  score: raw.acf?.score ?? null,
  vod: raw.acf?.vod_services ?? [],
  isCinemaShowing: raw.acf?.is_cinema_showing ?? false,
  ...
})
```

---

## 5. 移行チェックリスト

### フェーズ 1: 基盤整備

- [ ] `lib/api/wordpress.ts` に全エンドポイント定義
- [ ] `lib/api/wordpress.schema.ts` に型 / バリデーション追加
- [ ] `transformPost()` で ACF フィールドを全て正規化
- [ ] Polylang ↔ Next.js locale 対応確認

### フェーズ 2: ページ別実装

- [ ] `pages/index.tsx` + `templates/HomeTemplate`
- [ ] `pages/[category]/index.tsx` + `templates/ListTemplate`
- [ ] `pages/[...slug].tsx` + `templates/PostDetail`
  - [ ] `features/Post/PostContent`（ACF フィールド全対応）
  - [ ] `features/StreamingVod`
  - [ ] `features/RelationPost`
  - [ ] `features/AdRental`
- [ ] `pages/search.tsx`
- [ ] `pages/404.tsx` + `templates/NotFoundTemplate`

### フェーズ 3: SEO / メタ

- [ ] `next-seo` 導入
- [ ] `head-social.php` 相当の OGP / Twitter Card 実装
- [ ] `schema.php` 相当の JSON-LD 実装
- [ ] サイトマップ（`next-sitemap`）設定

### フェーズ 4: 品質確認

- [ ] 全コンポーネントに Storybook Story 作成
- [ ] 異常系 Story（NoImage / LongTitle / MixedData / Dense / Extreme）
- [ ] Lighthouse スコア確認（Performance / SEO / A11y）
- [ ] WordPress との表示比較（主要ページ）

---

## 6. 注意事項

### 著者ページ

WordPress では著者アーカイブを `functions.php` でホームにリダイレクトしている。  
Next.js では `/author/[slug]` ページは作成せず、`pages/404.tsx` へリダイレクトする。

```ts
// next.config.js
redirects: async () => [
  { source: '/author/:slug', destination: '/404', permanent: false },
]
```

### 広告コード（A8.net / admax）

広告の `<script>` タグは SSR で問題が起きるため `next/script` で管理する。

```tsx
import Script from 'next/script'
<Script src="https://adm.shinobi.jp/s/..." strategy="lazyOnload" />
```

### Facebook ページ埋め込み

`<iframe>` はそのまま使用可能だが、`style` prop は禁止ルールのため CSS クラスで管理する。

### 映画公開中フラグ（`single-cinema-check.php`）

ACF フィールド `is_cinema_showing` を `transformPost()` で boolean 変換し、  
`features/CinemaCheck` または `features/StreamingVod` 内の条件分岐で処理する。
