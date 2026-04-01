# src/stories/layouts/

レイアウト系コンポーネントのストーリーを管理するディレクトリ。
`katsumascore_design_system` の `src/stories/layouts/` に対応する。

## コンポーネント一覧

| ディレクトリ | コンポーネント | 対応WPテンプレート | Storyバリエーション |
|---|---|---|---|
| `Header/` | サイトヘッダー | header.php | Desktop, Mobile, JA, EN |
| `Footer/` | サイトフッター | footer.php | Default |
| `Sidebar/` | サイドバー | sidebar.php | Default, WithAds |
| `Navigation/` | ナビゲーション | - | Default, Mobile |
| `Sharing/` | SNSシェアボタン | - | Default, Copied |

## 共通ルール

- **SCSSのみ使用**（Tailwind不使用）
- SCSSは `src/scss/layout/` 以下に配置
- 各コンポーネントはdesign_systemのBEM命名を継承

## Header コンポーネントの機能

- ナビゲーション（PC・モバイルドロワー）
- 言語切り替えUI（JA / EN）
- モバイルハンバーガーメニュー

## Sharing コンポーネントの機能

- X（Twitter）・Facebook・LINE等のSNSシェアボタン
- URLコピー機能（コピー完了アニメーション付き）
- 各SNSのブランドカラーはSCSSで管理
