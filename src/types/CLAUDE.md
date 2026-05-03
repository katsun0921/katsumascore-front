# src/types/

TypeScript型定義を管理するディレクトリ。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `wordpress.ts` | WP REST API・ACFフィールドの型定義 |

## 主要な型

### WPPost

WP REST APIのレスポンス型。ACFフィールドをすべて含む。

```ts
interface WPPost {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  date: string
  featured_media: number
  _embedded?: { 'wp:featuredmedia': [{ source_url: string }] }
  acf?: {
    review_score?: 1 | 2 | 3 | 4 | 5
    title_jp?: string
    title_en?: string
    acf_summary_group?: { summary_jp?: string; summary_en?: string }
    actors_filed?: { name: string; role?: string }[]
    release_date?: string           // Ymd形式
    good_point_filed?: string
    official_url?: string
    official_sns?: string
    streaming_vod_netflix?: boolean
    streaming_vod_amazon?: boolean
    streaming_vod_unext?: boolean
    is_cinema_showing?: boolean
  }
}
```

### Post（正規化後）

`mapWPPostToPost` が `acf.title_jp` / `title_en` を解決し、`title` と任意の `originalTitle` を組み立てる。アプリ層では ACF のタイトルキーを直接参照しない。

### ScoreRank

```ts
type ScoreRank = 'SS' | 'S' | 'A' | 'B' | 'C'
```

## 注意事項

- ACFの `review_score` は `1〜5` の整数（`number`）
- Storybookの Score コンポーネントに渡すときは文字列 `'1'|'2'|'3'|'4'|'5'` に変換する
- `actors_filed` はACFのフィールド名スペルミスをそのまま維持（WP側に合わせる）
