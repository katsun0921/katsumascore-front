# src/stories/components/

汎用UIコンポーネントのストーリーを管理するディレクトリ。

## コンポーネント一覧

| ディレクトリ | コンポーネント | SCSS | Storyバリエーション |
|---|---|---|---|
| `Score/` | スコアバッジ（六角形） | `_score.scss` | Score1, Score3, Score5, SizeMedium, SizeLarge |
| `VodBadge/` | VOD配信バッジ | `_vodbadge.scss` | AllAvailable, OnlyNetflix, OnlyAmazon, OnlyUnext, Cinema, NoneAvailable |
| `Category/` | カテゴリーラベル | `_category.scss` | Default, Active |
| `Tag/` | タグラベル | `_tag.scss` | Default |
| `HamburgerMenu/` | ハンバーガーメニュー | `_hamburger.scss` | Default, Open |
| `Heading/` | 見出し | `_heading.scss` | H1, H2, H3 |
| `Link/` | リンク | `_link.scss` | Default, External |
| `List/` | リスト | `_list.scss` | Default |
| `Search/` | 検索フォーム | `_search.scss` | Default |

## Score コンポーネントの Props

```ts
interface ScoreProps {
  score: '1' | '2' | '3' | '4' | '5'
  size?: 'medium' | 'large'
}
```

スコアと表示の対応:
- `5` → SS（large）
- `4` → S（large）
- `3` → A（medium）
- `2` → B（medium）
- `1` → C（medium）

## VodBadge コンポーネントの Props

```ts
interface VodBadgeProps {
  netflix?: boolean
  amazon?: boolean
  unext?: boolean
  isCinema?: boolean  // trueなら「劇場公開中」バッジのみ表示・VOD非表示
}
```
