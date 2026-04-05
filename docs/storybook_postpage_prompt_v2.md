# Storybook → PostTemplate 実装プロンプト

## ■ 目的
WordPress `single.php` をベースに、指定URLのページを **Storybook上で完全再現可能なテンプレートコンポーネント（PostTemplate）として実装する。**

最終ゴール：
- Storybookで記事ページが再現される
- 既存components構造に完全準拠
- Next.jsへそのまま移植可能な設計（ただし現時点では使用しない）

---

## ■ 対象

- URL  
https://katsumascore.blog/equalizer-2014/

- 元ファイル  
`katsumascore_wordpress_theme/single.php`

---

## ■ 配置（最重要）

```bash
components/templates/PostTemplate/
```

---

## ■ ディレクトリ構成

```bash
PostTemplate/
├── PostTemplate.tsx
├── PostTemplate.stories.tsx
├── PostTemplate.types.ts
└── PostTemplate.scss（必要な場合のみ）
```

---

## ■ 設計ルール

### 1. templates層として実装

- UIではない
- featureでもない
- **ページ構造を統合する層**

---

### 2. PageLayoutを必ず使用

既存：
```
components/templates/PageLayout
```

これをベースにする：

```tsx
<PageLayout>
  <Header />
  <Container>
    <Main>
      （記事コンテンツ）
    </Main>
    <Sidebar />
  </Container>
  <Footer />
</PageLayout>
```

---

### 3. featuresを組み合わせるだけ

PostTemplateはロジック禁止：

```tsx
<ArticleHeader />
<ArticleMeta />
<PostContent />
<Score />
<VodPanel />
<RelationPost />
```

---

### 4. WordPress依存の完全排除

削除対象：

- the_title()
- the_content()
- get_header()
- get_footer()
- get_sidebar()

→ すべてpropsへ

---

## ■ データ設計（mock）

```ts
const mockPost = {
  title: "イコライザー（2014）レビュー",
  date: "2014-10-25",
  category: "映画レビュー",
  thumbnail: "/images/sample.jpg",
  content: "<p>ここに本文HTML</p>",
  score: 85,
  vod: {
    netflix: true,
    amazon: true,
    unext: false
  }
}
```

---

## ■ Storybook

```ts
export const Default = {
  args: {
    post: mockPost
  }
}
```

---

## ■ レイアウト要件

- PC：2カラム（記事 + Sidebar）
- SP：1カラム
- Header / Footer：共通

---

## ■ デザインルール

- Design Token必須 fileciteturn0file1
- 色の直書き禁止
- fontルール厳守
- SCSSはコンポーネント単位

---

## ■ HTML描画

```tsx
import parse from 'html-react-parser'

<div>{parse(content)}</div>
```

---

## ■ 実装ステップ

1. single.php構造を分解
2. セクションごとにfeaturesへ対応付け
3. PostTemplateで統合
4. mockデータ作成
5. Storybook登録
6. 見た目調整

---

## ■ 完成条件

- URLと同等のUI
- Storybook単体で成立
- WordPress依存ゼロ
- Next.js移行可能構造

---

## ■ アーキテクチャ整合

Next.js Pages Router前提構成に適合 fileciteturn0file0

---

## ■ 注意

```ts
/**
 * このコンポーネントはStorybook用テンプレート
 * 本番（Next.js）では使用しない
 */
```

---

## ■ 最終アウトプット

- PostTemplate
- stories
- mock
- features統合構造

---

以上の要件に従い実装してください。
