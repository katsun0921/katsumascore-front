# Storybook Style Migration Workflow

## 目的

`katsumascore_design_system` のスタイル設計を参照しながら、`katsumascore-front` の Storybook コンポーネントへ段階的に移行するための作業手順をまとめる。

## 最初に必ず読むもの

移行を始める前に、以下を必ず確認する。

1. `docs/katsumascore_design_rules.md`
2. `katsumascore_design_system/doc/04-styling.md`
3. 必要に応じて `katsumascore_design_system/doc/03-components.md`
4. 必要に応じて `katsumascore_design_system/doc/02-architecture.md`

## 参照URL

移行前の design system Storybook:

`https://katsun0921.github.io/katsumascore_design_system/?path=/story/styles-color--colors-list`

## 基本方針

- 先にルールを読む
- 次に `katsumascore_design_system` の該当コンポーネントを読む
- 最後に `katsumascore-front` 側へ最小差分で移植する
- `src/styles/scss` のような専用SCSSディレクトリは作らない
- SCSS は `Component.tsx` と同じディレクトリに `Component.scss` として置く
- 色は直接値で書かず、必ず既存ルールと Token の責務に合わせる
- レイアウトと余白は構造として整理し、見た目の意味づけはスタイルルールに合わせる
- Storybook で見た目確認してから次のコンポーネントへ進む

## 作業ステップ

### 1. 対象コンポーネントを決める

- 例: `Score`, `Search`, `VodBadge`, `ListTaxonomy`, `ListSocialIcon`
- `katsumascore-front` 側の実装ファイルと story ファイルを確認する
- `katsumascore_design_system` 側に対応する実装があるか確認する

### Step 1 の結果

まずは `src/components/ui` 配下を優先対象とする。

#### 優先度A

現行 Story があり、design system 側にも対応コンポーネントがあるもの。

| Component | front | design system | 備考 |
|---|---|---|---|
| `Category` | `src/components/ui/Category/Category.tsx` | `katsumascore_design_system/src/stories/components/Category/Category.tsx` | 移行しやすい |
| `Heading` | `src/components/ui/Heading/Heading.tsx` | `katsumascore_design_system/src/stories/components/Heading/Heading.tsx` | 見た目比較しやすい |
| `Score` | `src/components/ui/Score/Score.tsx` | `katsumascore_design_system/src/stories/components/Score/Score.tsx` | 現行実装が最小なので差分が明確 |
| `PostContent` | `src/features/post/components/PostContent.tsx` | `katsumascore_design_system/src/stories/post/PostContent.tsx` | 本文スタイル移行の基点 |
| `PostOverlay` | `src/features/post/components/PostOverlay.tsx` | `katsumascore_design_system/src/stories/projects/Post/PostOverlay.tsx` | Post 系カードの1つ |
| `PostTopImage` | `src/features/post/components/PostTopImage.tsx` | `katsumascore_design_system/src/stories/projects/Post/PostTopImage.tsx` | Post 系カードの1つ |
| `PostLeftImage` | `src/features/post/components/PostLeftImage.tsx` | `katsumascore_design_system/src/stories/projects/Post/PostLeftImage.tsx` | Post 系カードの1つ |

#### 優先度B

front 側に実装があり、design system 側にも対応コンポーネントがあるもの。

| Component | front | design system | 備考 |
|---|---|---|---|
| `Search` | `src/components/ui/Search/Search.tsx` | `katsumascore_design_system/src/stories/components/Search/Search.tsx` | 既存 story 追加候補 |
| `ListHeader` | `src/components/ui/List/ListHeader.tsx` | `katsumascore_design_system/src/stories/components/List/ListHeader.tsx` | List 系の基点 |
| `ListTaxonomy` | `src/components/ui/List/ListTaxonomy.tsx` | `katsumascore_design_system/src/stories/components/List/ListTaxonomy.tsx` | DOM 比較が必要 |
| `ListSocialIcon` | `src/components/ui/List/ListSocialIcon.tsx` | `katsumascore_design_system/src/stories/components/List/ListSocialIcon.tsx` | Link 系と合わせて確認 |
| `Link` | `src/components/ui/Link/Link.tsx` | `katsumascore_design_system/src/stories/components/Link/Link.tsx` | 下位依存として重要 |
| `LinkSocialIcon` | `src/components/ui/Link/LinkSocialIcon.tsx` | `katsumascore_design_system/src/stories/components/Link/LinkSocialIcon.tsx` | ListSocialIcon の依存先 |
| `HamburgerMenu` | `src/components/ui/HamburgerMenu/HamburgerMenu.tsx` | `katsumascore_design_system/src/stories/components/HamburgerMenu/HamburgerMenu.tsx` | layout 側との関係あり |

#### 優先度C

front 側に固有実装があり、design system 側に直接の対応が薄いもの。

| Component | front | design system | 備考 |
|---|---|---|---|
| `VodBadge` | `src/components/ui/VodBadge/VodBadge.tsx` | 直接対応なし | Token と既存ルールに沿って独自整備する |

#### 最初の着手順

1. `PostContent`
2. `Heading`
3. `Score`
4. `Category`
5. `PostOverlay`
6. `PostTopImage`
7. `PostLeftImage`
8. `Search`
9. `ListTaxonomy`
10. `ListSocialIcon`
11. `VodBadge`

### 最初の着手対象

最初の移行対象は `PostContent` とする。

- front: `src/features/post/components/PostContent.tsx`
- design system: `katsumascore_design_system/src/stories/post/PostContent.tsx`

`PostContent` 内で使う見出しスタイルも合わせて移行対象とする。
特に `Heading` の `content-h2` / `content-h3` / `content-h4` を優先して扱う。

- front: `src/components/ui/Heading/Heading.tsx`
- design system: `katsumascore_design_system/src/stories/components/Heading/Heading.tsx`

### 2. デザインシステム側の参照元を読む

- 対応する TSX / story / SCSS を読む
- 使用している class 命名規則を確認する
- 依存している変数、画像、共通クラスを確認する
- 単体コンポーネントだけでなく、親レイアウト依存がないかも確認する

確認対象の例:

- `katsumascore_design_system/src/stories/components/**`
- `katsumascore_design_system/src/scss/object/component/**`
- `katsumascore_design_system/src/scss/global/**`
- `katsumascore_design_system/src/scss/layout/**`

### Step 2 の結果: PostContent

`PostContent` の参照元として、以下を確認した。

- `katsumascore_design_system/src/stories/post/PostContent.tsx`
- `katsumascore_design_system/src/stories/post/PostContent.stories.tsx`
- `katsumascore_design_system/src/scss/object/project/_post.scss`
- `katsumascore_design_system/src/stories/components/Heading/Heading.tsx`
- `katsumascore_design_system/src/scss/object/component/_heading.scss`

#### 読み取り結果

- design system 側の `PostContent` は `p-post` クラスを使用している
- front 側の `PostContent` は `p-content` クラスを使用しており、命名がずれている
- `Heading` 側には `content-h2` / `content-h3` / `content-h4` が存在する
- `PostContent` で見出しを整えるには、本文側スタイルと `Heading` 側の content 系スタイルを合わせて扱う必要がある

#### front 側の受け皿

- `src/features/post/components/PostContent.scss`
- `src/components/ui/Heading/Heading.scss`
- `src/features/post/components/PostContent.stories.tsx`
- `src/components/ui/Heading/Heading.stories.tsx`

#### 現時点の判断

- `Post` 系カード用スタイルは front 側 SCSS にすでに存在する
- `Heading` の content 系スタイルも front 側 SCSS にすでに存在する
- そのため、まずは `PostContent.tsx` と `Heading.tsx` のクラス接続と DOM の整合を優先する
- 必要に応じて `PostContent` 用の本文スタイルを追加で整備する

### 3. 現行フロント側の受け皿を確認する

- `src/components/**` の props と DOM 構造を確認する
- SCSS は TSX と同じディレクトリに置く
- 既存の Storybook 表示で崩れている点を先に把握する
- 移植で Next.js 本体に影響しないか確認する

### Step 3 の結果: PostContent / Heading

#### 実装判断

- `PostContent` は `p-content` を維持する
- `PostContent` から `./PostContent.scss` を直接 import する
- `Heading` は design system 側と同様に `type` から class を解決する
- `Heading` から `./Heading.scss` を直接 import する

```bash
.
PostContent.tsx
PostContent.scss
```

#### Storybook 側の補正

- `src/styles` 前提の設定を外し、Storybook 側はコンポーネント同階層の SCSS をそのまま読む構成にした

#### 検証結果

- `npm run build-storybook` は成功
- `Heading` 用 CSS アセットが build 出力に含まれることを確認

### 4. 移行方針を決める

- そのまま移植できるもの
- `katsumascore-front` 用に DOM を合わせ直す必要があるもの
- Token / 命名 / import パスだけ調整すればよいもの
- 今は見送り、後続タスクに切り出すもの

### 5. スタイルを移行する

- 必要な SCSS を対応するコンポーネントディレクトリへ追加する
- 既存コンポーネントに必要最小限の className を付与する
- reset と base だけは `src/styles/globals.css` に統合する
- 画像やアセット参照があれば `public/` との整合を取る
- 直接色指定や場当たり的な上書きを避ける

### 6. Story を整える

- 各コンポーネントに最低 1 つの確認用 Story を用意する
- states がある場合はバリエーションを追加する
- 表示確認用のダミーデータは Story に閉じ込める
- Story のタイトル構成は既存の Storybook 階層に合わせる

### 7. 確認する

- `npm run storybook`
- `npm run build-storybook`
- 公開 URL でも表示を確認する

公開 URL:

`https://katsun0921.github.io/katsumascore-front/`

## コンポーネントごとの進め方

1. 対応する design system 側コンポーネントを読む
2. 対応する SCSS を読む
3. front 側コンポーネントの DOM と props を比較する
4. 必要な className と style import を追加する
5. Storybook で見た目を合わせる
6. build できることを確認する

## チェックリスト

- `docs/katsumascore_design_rules.md` を読んだ
- `katsumascore_design_system` の参照元を読んだ
- 直接色コードを書いていない
- Token / 役割ベースのスタイル方針を崩していない
- Storybook ローカル表示を確認した
- `npm run build-storybook` が通った
- GitHub Pages 公開 URL でも確認できる

## 備考

- `katsumascore_design_system` は参照元であり、そのまま複製する前提ではない
- 現行 `katsumascore-front` の構造に合わせて、必要な分だけ移植する
- まずは `components/ui` 配下の Storybook コンポーネントを優先する
