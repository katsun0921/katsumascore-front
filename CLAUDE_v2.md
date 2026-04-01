# KatsumaScore フロントエンド設計・移行ガイド（CLAUDE.md）

> v2.0 ― ディレクトリ設計統合・責務分離の明文化  
> 2026年4月1日

## ■ 本ドキュメントの位置付け

本ドキュメントは以下を統合した唯一の正規仕様である：

- WordPress → Next.js 移行ガイド
- フロントエンド設計規約
- Storybook設計ルール

---

## ■ 最重要原則（必読）

### 1. Feature First設計

src/
├── features/
│   └── post/

- すべてのドメインロジックは features に集約する
- components にビジネスロジックを書かない

---

### 2. レイヤー責務

| レイヤー | 役割 |
|----------|------|
| features | ロジック・データ整形 |
| components/ui | 純粋UI |
| components/layout | 構造 |
| pages | 組み立て |

---

### 3. WordPress依存の隔離

❌ 禁止: post.title.rendered  
✅ 必須: normalizedPost.title

---

## ■ ディレクトリ構成（最新版）

src/
├── components/
│   ├── ui/
│   └── layout/
│
├── features/
│   └── post/
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       ├── types/
│       └── styles/
│
├── lib/
│   └── api/
│       └── wordpress.ts
│
├── pages/
├── styles/
└── types/

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
