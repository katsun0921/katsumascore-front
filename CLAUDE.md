# KatsumaScore フロントエンド設計・移行ガイド（CLAUDE.md）

> v3.0 ― Storybook最終構造（ACF統合版）反映  
> 2026年4月4日

## ■ 本ドキュメントの位置付け

本ドキュメントは以下を統合した唯一の正規仕様である：

- WordPress → Next.js 移行ガイド
- フロントエンド設計規約
- Storybook設計ルール

---

## ■ 最重要原則（必読）

### 1. Feature First設計

components/
├── features/
│   └── PostCard, PostList, VodPanel, ...
└── features/ArticleBlock/
    └── Summary, GoodPoint, ...

- すべてのドメインロジックはcomponents/featuresに集約する
- components/uiにビジネスロジックを書かない

---

### 2. レイヤー責務

| レイヤー | 役割 |
|----------|------|
| components/features | 機能コンポーネント（PostCard, ArticleBlock等） |
| components/features/ArticleBlock | ACFコンポーネント群 |
| components/ui | 純粋UI（Score, Heading, Badge等） |
| components/layout | 構造（Header, Footer, Sidebar等） |
| pages | 組み立て |

---

### 3. WordPress依存の隔離

❌ 禁止: post.title.rendered  
✅ 必須: normalizedPost.title

---

## ■ UI設計原則（追加）

### 1. コンポーネント責務分離（厳守）

- PostCard：最小UI（データ表示のみ）
- PostVariants：レイアウト差分（ラップのみ）
- PostList：配置（レイアウトエンジン）
- PostSection：意味と余白
- Template：画面構造

❌ 禁止:
- variantによる分岐（variant="grid" など）
- コンポーネント内でのデータ取得
- UIとレイアウト責務の混在

---

### 2. レイアウト設計原則

- 余白は親コンポーネントが管理する
- 子コンポーネントはmarginを持たない
- 高さは「揃える / 崩す」を意図的に設計する
- grid崩れを許容しない

---

### 3. Storybook設計原則

- StorybookはUI確認ツールではなくUI仕様書とする
- 必ず異常系（Chaos）を含める
- 以下を最低限含める:
  - LongTitle
  - NoImage
  - MixedData
  - Dense（10+）
  - Extreme（20+）

---

### 4. データ設計原則

- APIレスポンスは必ずtransformする
- UIは正規化データのみ扱う
- null / 欠損を前提に設計する

---

### 5. 禁止ルール（強化）

- fetchをcomponents内で使用
- WordPressレスポンスを直接使用
- any型の使用
- ハードコードカラー（#xxxxxx）
- Tailwindの色指定（bg-blue-500など）

---

### 6. Lintによる設計強制

本プロジェクトでは以下を自動検出する:

- variantの不正使用
- コンポーネント内fetch
- Story未作成
- ディレクトリ構造違反

👉 設計は「守るもの」ではなく「破れないもの」とする

---

## ■ ディレクトリ構成（最新版）

```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── templates/
│   │   └── HomeTemplate/
│   │
│   └── features/
│       └── post/
│           ├── PostCard/
│           ├── PostLeftImage/
│           ├── PostTopImage/
│           ├── PostOverlay/
│           ├── PostList/
│           ├── PostSection/
│           ├── PostContent/
│           ├── PostDetail/
│           │
│           ├── types/
│           ├── mocks/
│           ├── hooks/
│           ├── utils/
│           └── index.ts
│
├── lib/
│   └── api/
│       ├── wordpress.ts
│       └── wordpress.schema.ts
│
├── pages/
├── styles/
└── types/
```

---

## ■ スタイリング設計（厳守）

### 原則：Tailwind と SCSS を混在させない

| 対象 | 技術 |
|------|------|
| pages / layout | Tailwind |
| Storybookコンポーネント | SCSS |

---

## ■ コンポーネント設計

### PostCard（基準設計）

type PostCardData = {
  id: number
  title: string
  excerpt: string
  thumbnail: string
  score?: number
  category?: string
  href: string
}

---

### ■ Post構造設計（重要）

PostCard → UI最小単位  
PostVariants → レイアウト  
PostList → 配置  
PostSection → 意味  
Template → 画面

👉 variantではなく構造で解決する

---

## ■ データフロー

WordPress API
↓
lib/api
↓
features（正規化）
↓
components
↓
pages

---

## ■ 禁止事項

- WordPress生データの使用
- componentsにロジックを書く
- スタイル責務違反
- PageLayoutに処理を書く

---

## ■ 最終指針

このプロジェクトは「WordPressテーマの移植」ではない。  
“再設計されたフロントエンド”である。
