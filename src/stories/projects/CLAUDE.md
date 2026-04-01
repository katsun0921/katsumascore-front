# src/stories/projects/

ページ単位の複合コンポーネントのストーリーを管理するディレクトリ。
複数のコンポーネントを組み合わせた、ページに近い粒度のコンポーネント群。

## ディレクトリ構成

| ディレクトリ | 役割 | WPテンプレートpartの対応 |
|---|---|---|
| `Post/` | 投稿表示パターン（TopImage・LeftImage・Overlay） | template-parts/post/ |
| `Info/` | 作品情報（キャスト・公式URL・スコア等） | template-parts/plugins/acf/ |
| `Content/` | 記事本文エリア | template-parts/post/ |
| `Summary/` | あらすじセクション | acf_summary_group |

## 実装ルール

- **SCSSのみ使用**（Tailwind不使用）
- SCSSは `src/scss/object/project/` 以下に配置
- BEM命名: `.p-{block}__element--modifier`（`p-` はproject層のプレフィックス）
- 子コンポーネント（Score・VodBadge等）をcompositeして構成する

## Post/ の Storyバリエーション

- `PostTopImage` — アイキャッチ上部表示
- `PostLeftImage` — アイキャッチ左カラム表示
- `PostOverlay` — アイキャッチオーバーレイ表示
- `Featured` — 特集記事スタイル
