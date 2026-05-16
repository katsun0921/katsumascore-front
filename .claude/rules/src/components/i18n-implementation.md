---
paths:
  - src/components/**
  - src/i18n/**
---

# i18n 実装ルール

## 原則

- 設計しすぎない。実際の使用頻度から最適化する
- 初期はコンポーネント単位で分散し、問題を観測してから共通化する

## フェーズ構成

| フェーズ | 状態 | 内容 |
|----------|------|------|
| 1（現行） | 運用中 | コンポーネント単位のi18n |
| 2 | 将来 | 頻出語の検知・警告 |
| 3 | 将来 | global i18nへ昇格（Design Token化） |
| 4 | 将来 | `/src/i18n/messages.ts` に統合 |

## フェーズ1ルール（厳守）

- i18nは各コンポーネント内に閉じる
- messagesはコンポーネント配下の `i18n.ts` に定義する
- keyはUI構造ベースで命名する（意味ベース禁止）
- path配列でアクセスする（string直書き禁止）

```ts
// ✅ 正しい
const label = t(messages, ['header', 'search'], locale)

// ❌ 禁止
const label = "検索"
```

## 実装構成

```
src/i18n/
├── t.ts          — t(messages, path[], locale) 関数。missing時にconsole.warn
└── provider.tsx  — I18nProvider + useLocale() hook

components/Header/
└── i18n.ts       — コンポーネントローカルのメッセージ定義
```

## i18n.ts の書き方

```ts
export const messages = {
  logo: {
    alt: { ja: 'KatsumaScore', en: 'KatsumaScore' },
  },
  cta: {
    watch: { ja: '動画配信を探す', en: 'Find Streaming' },
  },
} as const
```

- `as const` 必須
- keyはUI構造ベース（`logo.alt`、`cta.watch` など）
- ja / enの両キー必須

## コンポーネントでの使い方

```tsx
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'

const locale = useLocale()
const label = t(messages, ['cta', 'watch'], locale)
```

## ESLintルール

`katsumascore-ui/no-hardcoded-i18n` — 日本語・英語単語のハードコードを検出（現在: `warn`）

- 将来的に `error` へ昇格する
- 例外はコメントで個別に許可する:

```ts
// eslint-disable-next-line katsumascore-ui/no-hardcoded-i18n
const label = "OK"
```

## Storybook検証

- `I18nProvider` は `.storybook/preview.ts` のdecoratorで全Storyに適用済み
- toolbar（globeアイコン）でja / enをリアルタイム切替可能
- 翻訳漏れは `console.warn` で検知する
- locale固定のStoryは `globals: { locale: 'en' }` で指定する

```ts
export const English: Story = {
  globals: { locale: 'en' },
}
```
